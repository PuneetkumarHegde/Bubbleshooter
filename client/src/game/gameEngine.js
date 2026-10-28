// High-Polish Phaser 3 Bubble Shooter Game Engine
import Phaser from 'phaser';
import { GAME_CONSTANTS } from '../config/gameConfig';
import { HexGrid } from './collision';
import { MatchDetector } from './matchDetector';
import { FloatingDetector } from './floatingDetector';
import { ScoreManager } from './scoreManager';
import { ObjectiveManager } from './objectiveManager';
import soundManager from './audioEngine';
import { useGameStore, GAME_STATUS } from '../store/gameStore';

export class BubbleShooterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BubbleShooterScene' });
  }

  create() {
    this.canvasWidth = 480;
    this.canvasHeight = 680;
    this.hexGrid = new HexGrid(this.canvasWidth, this.canvasHeight);
    this.matchDetector = new MatchDetector(this.hexGrid);
    this.floatingDetector = new FloatingDetector(this.hexGrid);

    this.createProceduralTextures();

    // Scene groups and layers
    this.bubbleSprites = new Map(); // "r,c" -> Phaser.GameObjects.Sprite
    this.trajectoryGraphics = this.add.graphics().setDepth(5);
    this.targetMarker = this.add.graphics().setDepth(6);
    this.effectsContainer = this.add.container(0, 0).setDepth(25);

    // Launcher setup
    this.launcherX = this.canvasWidth / 2;
    this.launcherY = this.canvasHeight - 68;
    this.aimAngle = -Math.PI / 2;
    this.isAiming = false;
    this.movingBubble = null;

    this.createLauncher();
    this.setupInputHandlers();

    // Sync with Zustand store
    const store = useGameStore.getState();
    this.initLevel(store.level);

    // Subscribe to store updates
    this.unsubscribeStore = useGameStore.subscribe((state, prevState) => {
      if (state.gameStatus === GAME_STATUS.READY && prevState.gameStatus === GAME_STATUS.LOADING) {
        this.initLevel(state.level);
      }
      if (state.currentBubble !== prevState.currentBubble) {
        this.updateCurrentBubbleSprite();
      }
      if (state.nextBubble !== prevState.nextBubble) {
        this.updateNextBubbleSprite();
      }
      if (state.shotsRemaining <= 4 && prevState.shotsRemaining > 4) {
        this.setCompanionReaction('nervous');
      }
    });
  }

  // Generates 3D glossy spheres with embossed colorblind-accessible symbols
  createProceduralTextures() {
    const bubbleSpecs = {
      red:    { hex: '#ef4444', dark: '#991b1b', light: '#fca5a5', sym: '❤️' },
      blue:   { hex: '#3b82f6', dark: '#1e40af', light: '#93c5fd', sym: '💧' },
      green:  { hex: '#10b981', dark: '#065f46', light: '#6ee7b7', sym: '🍀' },
      yellow: { hex: '#f59e0b', dark: '#92400e', light: '#fde68a', sym: '⭐' },
      purple: { hex: '#8b5cf6', dark: '#5b21b6', light: '#c4b5fd', sym: '🌙' },
      orange: { hex: '#f97316', dark: '#9a3412', light: '#fdba74', sym: '☀️' },
      pink:   { hex: '#ec4899', dark: '#9d174d', light: '#fbcfe8', sym: '💎' },
      cyan:   { hex: '#06b6d4', dark: '#155e75', light: '#a5f3fc', sym: '❄️' },
    };

    const r = GAME_CONSTANTS.BUBBLE_RADIUS;
    const d = r * 2;

    Object.entries(bubbleSpecs).forEach(([name, spec]) => {
      if (this.textures.exists(`bubble_${name}`)) return;
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');

      // 1. Base 3D Sphere Shading
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.65, r * 0.1, r, r, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, spec.light);
      grad.addColorStop(0.65, spec.hex);
      grad.addColorStop(0.95, spec.dark);
      grad.addColorStop(1, '#090d16');

      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // 2. Embossed Interior Icon Symbol
      ctx.font = '13px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.fillText(spec.sym, r, r + 2);

      // 3. Crisp Glass Rim
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.stroke();

      // 4. Glossy Specular Light Reflection
      ctx.beginPath();
      ctx.ellipse(r * 0.65, r * 0.52, r * 0.34, r * 0.18, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.fill();

      // 5. Lower Ambient Bounce Light
      ctx.beginPath();
      ctx.arc(r, r * 1.35, r * 0.4, 0, Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();

      this.textures.addCanvas(`bubble_${name}`, canvas);
    });

    // Bomb Texture with glowing hazardous aura
    if (!this.textures.exists('bubble_bomb')) {
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.65, r * 0.1, r, r, r);
      grad.addColorStop(0, '#fed7aa');
      grad.addColorStop(0.3, '#f97316');
      grad.addColorStop(0.7, '#dc2626');
      grad.addColorStop(1, '#262626');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', r, r + 1);
      this.textures.addCanvas('bubble_bomb', canvas);
    }

    // Rainbow Wildcard Texture with prismatic gradient
    if (!this.textures.exists('bubble_rainbow')) {
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, d, d);
      grad.addColorStop(0, '#ef4444');
      grad.addColorStop(0.2, '#f59e0b');
      grad.addColorStop(0.4, '#10b981');
      grad.addColorStop(0.6, '#06b6d4');
      grad.addColorStop(0.8, '#8b5cf6');
      grad.addColorStop(1, '#ec4899');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.stroke();
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌈', r, r + 1);
      this.textures.addCanvas('bubble_rainbow', canvas);
    }

    // Rescue Star Sprite Creature inside a crystalline bubble
    if (!this.textures.exists('bubble_rescue')) {
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.7, r * 0.1, r, r, r);
      grad.addColorStop(0, '#fef9c3');
      grad.addColorStop(0.4, '#eab308');
      grad.addColorStop(0.9, '#a16207');
      grad.addColorStop(1, '#422006');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', r, r + 1);
      this.textures.addCanvas('bubble_rescue', canvas);
    }

    // Target Bubble
    if (!this.textures.exists('bubble_target')) {
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.7, r * 0.1, r, r, r);
      grad.addColorStop(0, '#f5d0fe');
      grad.addColorStop(0.5, '#c084fc');
      grad.addColorStop(1, '#4c1d95');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#e9d5ff';
      ctx.stroke();
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯', r, r + 1);
      this.textures.addCanvas('bubble_target', canvas);
    }
  }

  createLauncher() {
    // Glowing launcher pedestal
    this.launcherRing = this.add.circle(this.launcherX, this.launcherY + 20, 42, 0x1e1b4b, 0.8).setDepth(7);
    this.launcherRing.setStrokeStyle(3, 0x6366f1, 0.9);

    this.launcherBase = this.add.circle(this.launcherX, this.launcherY + 20, 36, 0x0f172a).setDepth(8);
    this.launcherBase.setStrokeStyle(2, 0x818cf8);

    // Aim cannon barrel
    this.launcherArrow = this.add.triangle(this.launcherX, this.launcherY, 0, 20, 13, -30, 26, 20, 0x6366f1).setDepth(9);
    this.launcherArrow.setOrigin(0.5, 0.72);
    this.launcherArrow.setStrokeStyle(2, 0xa5b4fc);

    // Loaded bubble in launcher (Interactive: click to swap)
    this.currentBubbleSprite = this.add.sprite(this.launcherX, this.launcherY, 'bubble_blue').setDepth(10);
    this.currentBubbleSprite.setScale(1.05);
    this.currentBubbleSprite.setInteractive({ useHandCursor: true });
    this.currentBubbleSprite.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.triggerBubbleSwap();
    });

    // --- NEXT BUBBLE QUEUE ON CANVAS ---
    this.nextBubbleX = 148;
    this.nextBubbleY = this.launcherY + 10;

    // Next Bubble Pedestal
    this.nextBubbleRing = this.add.circle(this.nextBubbleX, this.nextBubbleY, 26, 0x1e1b4b, 0.85).setDepth(7);
    this.nextBubbleRing.setStrokeStyle(2, 0x6366f1, 0.85);

    this.nextBubbleBase = this.add.circle(this.nextBubbleX, this.nextBubbleY, 21, 0x0f172a).setDepth(8);
    this.nextBubbleBase.setStrokeStyle(1.5, 0x818cf8);

    this.nextLabel = this.add.text(this.nextBubbleX, this.nextBubbleY + 28, 'NEXT', {
      fontSize: '10px',
      fontFamily: 'Fredoka, sans-serif',
      fontStyle: 'bold',
      color: '#a5b4fc',
    }).setOrigin(0.5).setDepth(9);

    // Next Bubble Sprite (Interactive: click to swap)
    this.nextBubbleSprite = this.add.sprite(this.nextBubbleX, this.nextBubbleY, 'bubble_blue').setDepth(10);
    this.nextBubbleSprite.setScale(0.88);
    this.nextBubbleSprite.setInteractive({ useHandCursor: true });
    this.nextBubbleSprite.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.triggerBubbleSwap();
    });

    // Interactive Swap Button Badge between Next & Launcher
    const swapX = 194;
    const swapY = this.launcherY + 6;
    this.swapButtonBg = this.add.circle(swapX, swapY, 13, 0x312e81, 0.95).setDepth(11);
    this.swapButtonBg.setStrokeStyle(2, 0xa5b4fc);
    this.swapButtonText = this.add.text(swapX, swapY, '⇄', {
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(12);

    this.swapButtonBg.setInteractive({ useHandCursor: true });
    this.swapButtonBg.on('pointerdown', (pointer, localX, localY, event) => {
      if (event) event.stopPropagation();
      this.triggerBubbleSwap();
    });
    this.swapButtonBg.on('pointerover', () => {
      this.tweens.add({ targets: [this.swapButtonBg, this.swapButtonText], scale: 1.2, duration: 100 });
    });
    this.swapButtonBg.on('pointerout', () => {
      this.tweens.add({ targets: [this.swapButtonBg, this.swapButtonText], scale: 1.0, duration: 100 });
    });

    // Helper Character Avatar (Sparky the Bubble Drake)
    this.sparkyContainer = this.add.container(48, this.canvasHeight - 48).setDepth(12);
    this.sparkyEmoji = this.add.text(0, 0, '🐲', { fontSize: '42px' }).setOrigin(0.5);
    this.sparkySpeech = this.add.text(0, -32, '', {
      fontSize: '11px',
      fontFamily: 'Fredoka, sans-serif',
      fontStyle: 'bold',
      color: '#fbbf24',
      backgroundColor: '#0f172a',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5).setAlpha(0);

    this.sparkyContainer.add([this.sparkyEmoji, this.sparkySpeech]);

    // Idle breathing tween
    this.tweens.add({
      targets: this.sparkyEmoji,
      scaleX: 1.12,
      scaleY: 0.92,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  setCompanionReaction(type, customText = '') {
    if (!this.sparkyEmoji) return;

    if (type === 'happy') {
      this.sparkyEmoji.setText('😍');
      this.showCompanionSpeech(customText || 'Awesome shot!');
      this.tweens.add({
        targets: this.sparkyContainer,
        y: this.canvasHeight - 65,
        duration: 180,
        yoyo: true,
        ease: 'Back.easeOut',
        onComplete: () => this.sparkyEmoji.setText('🐲'),
      });
    } else if (type === 'fire') {
      this.sparkyEmoji.setText('🔥');
      this.showCompanionSpeech('MEGA COMBO!');
      this.tweens.add({
        targets: this.sparkyContainer,
        scale: 1.25,
        duration: 250,
        yoyo: true,
        ease: 'Elastic.easeOut',
        onComplete: () => this.sparkyEmoji.setText('🐲'),
      });
    } else if (type === 'rescue') {
      this.sparkyEmoji.setText('🎉');
      this.showCompanionSpeech('Sprite Saved! ⭐');
      this.tweens.add({
        targets: this.sparkyContainer,
        y: this.canvasHeight - 75,
        duration: 300,
        yoyo: true,
        ease: 'Bounce.easeOut',
        onComplete: () => this.sparkyEmoji.setText('🐲'),
      });
    } else if (type === 'nervous') {
      this.sparkyEmoji.setText('😰');
      this.showCompanionSpeech('Careful! Low shots!');
      setTimeout(() => {
        if (this.sparkyEmoji) this.sparkyEmoji.setText('🐲');
      }, 2500);
    }
  }

  showCompanionSpeech(text) {
    if (!this.sparkySpeech) return;
    this.sparkySpeech.setText(text);
    this.sparkySpeech.setAlpha(1);
    this.tweens.add({
      targets: this.sparkySpeech,
      alpha: 0,
      y: -42,
      delay: 1200,
      duration: 400,
      onComplete: () => {
        this.sparkySpeech.setY(-32);
      },
    });
  }

  initLevel(levelData) {
    if (!levelData) return;
    this.levelData = levelData;
    this.objectiveManager = new ObjectiveManager(levelData.objective);

    // Clear existing sprites
    this.bubbleSprites.forEach(sprite => sprite.destroy());
    this.bubbleSprites.clear();

    // Render board
    const board = useGameStore.getState().board;
    for (let r = 0; r < board.length; r++) {
      if (!board[r]) continue;
      for (let c = 0; c < board[r].length; c++) {
        const cell = board[r][c];
        if (cell && !cell.isPopped) {
          this.createBubbleSprite(r, c, cell);
        }
      }
    }

    this.updateCurrentBubbleSprite();
    this.updateNextBubbleSprite();
  }

  createBubbleSprite(r, c, cell) {
    const { x, y } = this.hexGrid.gridToPixel(r, c);
    let textureKey = `bubble_${cell.color}`;
    if (cell.special === 'bomb') textureKey = 'bubble_bomb';
    else if (cell.special === 'rainbow') textureKey = 'bubble_rainbow';
    else if (cell.isRescue) textureKey = 'bubble_rescue';
    else if (cell.isTarget) textureKey = 'bubble_target';

    const sprite = this.add.sprite(x, y, textureKey).setDepth(2);
    sprite.setScale(0);
    this.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 220 + r * 22,
      ease: 'Back.easeOut',
    });

    this.bubbleSprites.set(`${r},${c}`, sprite);
    return sprite;
  }

  updateCurrentBubbleSprite() {
    const store = useGameStore.getState();
    const current = store.currentBubble;
    if (!current || !this.currentBubbleSprite) return;

    let textureKey = `bubble_${current.color}`;
    if (current.special === 'bomb') textureKey = 'bubble_bomb';
    else if (current.special === 'rainbow') textureKey = 'bubble_rainbow';

    this.currentBubbleSprite.setTexture(textureKey);
    this.currentBubbleSprite.setScale(0.8);
    this.tweens.add({
      targets: this.currentBubbleSprite,
      scale: 1.05,
      duration: 180,
      ease: 'Back.easeOut',
    });
  }

  updateNextBubbleSprite() {
    const store = useGameStore.getState();
    const next = store.nextBubble;
    if (!next || !this.nextBubbleSprite) return;

    let textureKey = `bubble_${next.color}`;
    if (next.special === 'bomb') textureKey = 'bubble_bomb';
    else if (next.special === 'rainbow') textureKey = 'bubble_rainbow';

    this.nextBubbleSprite.setTexture(textureKey);
    this.nextBubbleSprite.setScale(0.7);
    this.tweens.add({
      targets: this.nextBubbleSprite,
      scale: 0.88,
      duration: 180,
      ease: 'Back.easeOut',
    });
  }

  triggerBubbleSwap() {
    const store = useGameStore.getState();
    if (store.gameStatus !== GAME_STATUS.READY && store.gameStatus !== GAME_STATUS.AIMING) return;
    if (this.movingBubble) return; // Cannot swap while bubble is in flight

    soundManager.playAim();

    // Curved swap tween for both bubbles
    this.tweens.add({
      targets: this.currentBubbleSprite,
      x: this.nextBubbleX,
      y: this.nextBubbleY,
      scale: 0.88,
      duration: 160,
      ease: 'Back.easeIn',
    });

    this.tweens.add({
      targets: this.nextBubbleSprite,
      x: this.launcherX,
      y: this.launcherY,
      scale: 1.05,
      duration: 160,
      ease: 'Back.easeIn',
      onComplete: () => {
        store.swapBubbles();
        this.currentBubbleSprite.setPosition(this.launcherX, this.launcherY).setScale(1.05);
        this.nextBubbleSprite.setPosition(this.nextBubbleX, this.nextBubbleY).setScale(0.88);
        this.updateCurrentBubbleSprite();
        this.updateNextBubbleSprite();
      },
    });

    if (this.swapButtonText) {
      this.tweens.add({
        targets: this.swapButtonText,
        angle: this.swapButtonText.angle + 180,
        duration: 200,
        ease: 'Quad.easeOut',
      });
    }
  }

  setupInputHandlers() {
    // Mouse and touch aiming
    this.input.on('pointermove', (pointer) => {
      const store = useGameStore.getState();
      if (store.gameStatus !== GAME_STATUS.READY && store.gameStatus !== GAME_STATUS.AIMING) return;
      this.handleAim(pointer.x, pointer.y);
    });

    this.input.on('pointerdown', (pointer) => {
      const store = useGameStore.getState();
      if (store.gameStatus !== GAME_STATUS.READY) return;
      if (pointer.y < this.canvasHeight - 120) {
        useGameStore.getState().setGameStatus(GAME_STATUS.AIMING);
        this.handleAim(pointer.x, pointer.y);
      }
    });

    this.input.on('pointerup', (pointer) => {
      const store = useGameStore.getState();
      if (store.gameStatus === GAME_STATUS.AIMING || store.gameStatus === GAME_STATUS.READY) {
        if (pointer.y < this.canvasHeight - 100) {
          this.shootBubble();
        }
      }
    });

    // Keyboard Shortcuts
    this.input.keyboard.on('keydown-SPACE', () => {
      this.triggerBubbleSwap();
    });

    this.input.keyboard.on('keydown-U', () => {
      useGameStore.getState().undoShot();
      soundManager.playClick();
    });

    this.input.keyboard.on('keydown-Z', () => {
      useGameStore.getState().undoShot();
      soundManager.playClick();
    });

    this.input.keyboard.on('keydown-H', () => {
      useGameStore.getState().triggerHint();
      soundManager.playClick();
    });

    this.input.keyboard.on('keydown-R', () => {
      const store = useGameStore.getState();
      if (store.level) store.setLevel(store.level);
    });

    // Numerical Booster Shortcuts (1: Bomb, 2: Rainbow, 3: Aim, 4: Extra, 5: Shuffle)
    this.input.keyboard.on('keydown-ONE', () => useGameStore.getState().activateBooster('bomb'));
    this.input.keyboard.on('keydown-TWO', () => useGameStore.getState().activateBooster('rainbow'));
    this.input.keyboard.on('keydown-THREE', () => useGameStore.getState().activateBooster('aimGuide'));
    this.input.keyboard.on('keydown-FOUR', () => useGameStore.getState().activateBooster('extraShot'));
    this.input.keyboard.on('keydown-FIVE', () => useGameStore.getState().activateBooster('shuffle'));
  }

  handleAim(targetX, targetY) {
    const dx = targetX - this.launcherX;
    const dy = targetY - this.launcherY;

    let angle = Math.atan2(dy, dx);
    const minAngle = -Math.PI + 0.16;
    const maxAngle = -0.16;

    if (angle > 0) {
      angle = dx < 0 ? minAngle : maxAngle;
    } else {
      angle = Math.max(minAngle, Math.min(maxAngle, angle));
    }

    this.aimAngle = angle;
    this.launcherArrow.setRotation(angle + Math.PI / 2);
    useGameStore.getState().setAimAngle(angle);

    this.drawTrajectory();
  }

  drawTrajectory() {
    this.trajectoryGraphics.clear();
    this.targetMarker.clear();

    const store = useGameStore.getState();
    const hasAimGuide = store.activeBooster === 'aimGuide';

    let currentX = this.launcherX;
    let currentY = this.launcherY;
    let vx = Math.cos(this.aimAngle);
    let vy = Math.sin(this.aimAngle);

    const step = 14;
    const maxSteps = hasAimGuide ? 75 : 34;
    const radius = GAME_CONSTANTS.BUBBLE_RADIUS;
    const board = store.board;

    for (let i = 0; i < maxSteps; i++) {
      currentX += vx * step;
      currentY += vy * step;

      // Bounce off side walls
      if (currentX <= radius) {
        currentX = radius;
        vx = -vx;
      } else if (currentX >= this.canvasWidth - radius) {
        currentX = this.canvasWidth - radius;
        vx = -vx;
      }

      // Check collision with board
      const colCheck = this.hexGrid.checkCollision(currentX, currentY, board);
      if (colCheck.hit || currentY <= this.hexGrid.offsetY) {
        // Draw rotating landing target indicator
        this.targetMarker.lineStyle(2.5, 0xf59e0b, 0.95);
        this.targetMarker.strokeCircle(currentX, currentY, radius);
        this.targetMarker.fillStyle(0xf59e0b, 0.2);
        this.targetMarker.fillCircle(currentX, currentY, radius * 0.4);
        break;
      }

      // Draw dashed trajectory dot
      if (i % 2 === 0) {
        const alpha = Math.max(0.15, 1.0 - (i / maxSteps) * 0.7);
        this.trajectoryGraphics.fillStyle(0xffffff, alpha);
        this.trajectoryGraphics.fillCircle(currentX, currentY, 3.5);
      }
    }
  }

  shootBubble() {
    const store = useGameStore.getState();
    if (store.gameStatus !== GAME_STATUS.READY && store.gameStatus !== GAME_STATUS.AIMING) return;
    if (store.shotsRemaining <= 0) return;

    store.saveHistorySnapshot();
    store.setGameStatus(GAME_STATUS.SHOOTING);
    store.decrementShots();
    this.trajectoryGraphics.clear();
    this.targetMarker.clear();

    const current = store.currentBubble;
    let textureKey = `bubble_${current.color}`;
    if (current.special === 'bomb') textureKey = 'bubble_bomb';
    else if (current.special === 'rainbow') textureKey = 'bubble_rainbow';

    // The current bubble takes flight with its exact color
    this.movingBubble = {
      sprite: this.add.sprite(this.launcherX, this.launcherY, textureKey).setDepth(15),
      x: this.launcherX,
      y: this.launcherY,
      vx: Math.cos(this.aimAngle) * GAME_CONSTANTS.BUBBLE_SPEED,
      vy: Math.sin(this.aimAngle) * GAME_CONSTANTS.BUBBLE_SPEED,
      color: current.color,
      special: current.special,
    };

    // Hide launcher bubble while current shot is in flight
    if (this.currentBubbleSprite) {
      this.currentBubbleSprite.setVisible(false);
    }

    soundManager.playLaunch();

    // Launcher spring recoil
    this.tweens.add({
      targets: this.launcherBase,
      scale: 0.88,
      duration: 75,
      yoyo: true,
      ease: 'Quad.easeInOut',
    });
  }

  update(time, delta) {
    if (!this.movingBubble) return;

    const dt = delta / 1000;
    const mb = this.movingBubble;
    const radius = GAME_CONSTANTS.BUBBLE_RADIUS;

    mb.x += mb.vx * dt;
    mb.y += mb.vy * dt;

    // Wall bounce
    if (mb.x <= radius) {
      mb.x = radius;
      mb.vx = -mb.vx;
      soundManager.playCollision();
    } else if (mb.x >= this.canvasWidth - radius) {
      mb.x = this.canvasWidth - radius;
      mb.vx = -mb.vx;
      soundManager.playCollision();
    }

    mb.sprite.setPosition(mb.x, mb.y);

    const store = useGameStore.getState();
    const board = store.board;
    const colCheck = this.hexGrid.checkCollision(mb.x, mb.y, board);
    const hitCeiling = mb.y <= this.hexGrid.offsetY + radius * 0.5;

    if (colCheck.hit || hitCeiling) {
      this.resolveCollision(mb, colCheck.hit ? colCheck : null);
      this.movingBubble = null;
    }
  }

  resolveCollision(mb, hitTarget = null) {
    const store = useGameStore.getState();
    store.setGameStatus(GAME_STATUS.RESOLVING);

    const slot = this.hexGrid.findSnapPosition(mb.x, mb.y, store.board, hitTarget);
    mb.sprite.destroy();

    // Destroy any existing sprite at that slot before placing the new bubble
    const key = `${slot.row},${slot.col}`;
    if (this.bubbleSprites.has(key)) {
      this.bubbleSprites.get(key).destroy();
      this.bubbleSprites.delete(key);
    }

    const board = store.board;
    if (!board[slot.row]) board[slot.row] = [];
    board[slot.row][slot.col] = {
      row: slot.row,
      col: slot.col,
      color: mb.color,
      special: mb.special,
      isRescue: false,
      isTarget: false,
      isPopped: false,
    };

    const sprite = this.createBubbleSprite(slot.row, slot.col, board[slot.row][slot.col]);
    soundManager.playCollision();

    // Elastic snap impact tween
    this.tweens.add({
      targets: sprite,
      scaleX: 1.25,
      scaleY: 0.82,
      duration: 80,
      yoyo: true,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.processMatchesAndFalls(slot.row, slot.col, mb.special);
      },
    });
  }

  processMatchesAndFalls(row, col, specialType) {
    const store = useGameStore.getState();
    const board = store.board;

    const { matches, isBomb } = this.matchDetector.findMatches(row, col, board, specialType);
    let poppedCount = 0;
    let rescuedCount = 0;

    if (matches.length >= 3 || isBomb) {
      poppedCount = matches.length;
      store.incrementCombo();
      const currentCombo = useGameStore.getState().combo;

      if (isBomb) {
        soundManager.playBomb();
        this.cameras.main.shake(140, 0.007);
        this.createExplosionEffect(row, col);
      } else {
        const colorKey = matches[0]?.bubble?.color || 'blue';
        soundManager.playMultiPop(poppedCount, colorKey);
        if (currentCombo >= 2) {
          soundManager.playCombo(currentCombo);
          this.setCompanionReaction(currentCombo >= 4 ? 'fire' : 'happy');
        }
      }

      // Pop matched bubbles
      matches.forEach(item => {
        const key = `${item.row},${item.col}`;
        const b = board[item.row] && board[item.row][item.col];
        if (b && !b.isPopped) {
          b.isPopped = true;
          if (b.isRescue) rescuedCount++;
          const sp = this.bubbleSprites.get(key);
          if (sp) {
            this.animatePop(sp, b.color, item.row, item.col);
            this.bubbleSprites.delete(key);
          }
        }
      });

      // Detect floating disconnected bubbles
      const floating = this.floatingDetector.findFloatingBubbles(board);
      if (floating.length > 0) {
        soundManager.playFloatingFall();
        floating.forEach((item, idx) => {
          const key = `${item.row},${item.col}`;
          const b = board[item.row] && board[item.row][item.col];
          if (b && !b.isPopped) {
            b.isPopped = true;
            if (b.isRescue) rescuedCount++;
            const sp = this.bubbleSprites.get(key);
            if (sp) {
              this.animateFall(sp, idx * 30);
              this.bubbleSprites.delete(key);
            }
          }
        });
      }

      // Calculate score
      const shotScore = ScoreManager.calculateShotScore({
        matchesCount: poppedCount,
        floatingCount: floating.length,
        rescueCount: rescuedCount,
        combo: currentCombo,
      });
      store.addScore(shotScore);
      this.showScoreFloater(this.canvasWidth / 2, this.canvasHeight / 2 - 50, `+${shotScore}`, currentCombo);

      if (rescuedCount > 0) {
        soundManager.playRescue();
        this.setCompanionReaction('rescue');
        this.showRescueCelebration();
      }
    } else {
      store.resetCombo();
    }

    // Evaluate Objectives
    const progress = this.objectiveManager.updateProgress({
      board,
      poppedBubbles: matches,
      currentScore: store.score,
      currentCombo: store.combo,
    });
    store.setObjectiveProgress(progress);

    // Check Victory or Game Over
    this.time.delayedCall(450, () => {
      this.checkGameEnd(progress.completed);
    });
  }

  animatePop(sprite, colorKey, r, c) {
    this.tweens.add({
      targets: sprite,
      scale: 1.4,
      alpha: 0,
      duration: 160,
      ease: 'Back.easeIn',
      onComplete: () => sprite.destroy(),
    });

    // Multi-color particle spark burst
    const particleColors = [0xffffff, 0xfde047, 0xf472b6, 0x60a5fa, 0x4ade80];
    for (let i = 0; i < 7; i++) {
      const pColor = particleColors[i % particleColors.length];
      const p = this.add.circle(sprite.x, sprite.y, 4, pColor).setDepth(25);
      const angle = (Math.PI * 2 / 7) * i + Math.random() * 0.3;
      const dist = 32 + Math.random() * 22;
      this.tweens.add({
        targets: p,
        x: sprite.x + Math.cos(angle) * dist,
        y: sprite.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.15,
        duration: 360,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  animateFall(sprite, delay) {
    this.tweens.add({
      targets: sprite,
      y: this.canvasHeight + 60,
      rotation: Math.PI * 1.5 + Math.random() * 2,
      alpha: 0.5,
      delay,
      duration: 520,
      ease: 'Cubic.easeIn',
      onComplete: () => sprite.destroy(),
    });
  }

  createExplosionEffect(r, c) {
    const { x, y } = this.hexGrid.gridToPixel(r, c);
    const shockwave = this.add.circle(x, y, 10, 0xf97316, 0.85).setDepth(26);
    this.tweens.add({
      targets: shockwave,
      radius: 95,
      alpha: 0,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => shockwave.destroy(),
    });

    // Fire sparks
    for (let i = 0; i < 12; i++) {
      const spark = this.add.circle(x, y, 5, 0xfef08a).setDepth(27);
      const ang = Math.random() * Math.PI * 2;
      const dist = 40 + Math.random() * 50;
      this.tweens.add({
        targets: spark,
        x: x + Math.cos(ang) * dist,
        y: y + Math.sin(ang) * dist,
        alpha: 0,
        duration: 380,
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy(),
      });
    }
  }

  showScoreFloater(x, y, text, combo) {
    const praises = ['NICE!', 'GREAT!', 'AWESOME!', 'SUPER!', 'POPTASTIC!'];
    const praiseText = praises[Math.min(combo - 1, praises.length - 1)] || '';
    const msg = combo >= 2 ? `${praiseText} ${text} (x${combo})` : text;

    const floater = this.add.text(x, y, msg, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: combo >= 3 ? '26px' : '20px',
      fontStyle: 'bold',
      color: combo >= 3 ? '#fbbf24' : '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: floater,
      y: y - 50,
      scale: 1.1,
      alpha: 0,
      duration: 650,
      ease: 'Back.easeOut',
      onComplete: () => floater.destroy(),
    });
  }

  showRescueCelebration() {
    const banner = this.add.text(this.canvasWidth / 2, 210, '⭐ STAR SPRITE RESCUED! ⭐', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#fef08a',
      stroke: '#451a03',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(35).setScale(0.2);

    this.tweens.add({
      targets: banner,
      scale: 1.1,
      duration: 280,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: banner,
          alpha: 0,
          y: 180,
          delay: 450,
          duration: 320,
          onComplete: () => banner.destroy(),
        });
      },
    });
  }

  checkGameEnd(isObjectiveCompleted) {
    const store = useGameStore.getState();

    if (isObjectiveCompleted) {
      const finalScore = ScoreManager.calculateFinalScore(store.score, store.shotsRemaining);
      const stars = ScoreManager.calculateStars(finalScore, store.level.starThresholds);
      store.addScore(finalScore - store.score);
      store.setGameStatus(GAME_STATUS.LEVEL_COMPLETE);
      soundManager.playLevelComplete();
      soundManager.playStar(stars);
      return;
    }

    if (store.shotsRemaining <= 0) {
      store.setGameStatus(GAME_STATUS.LEVEL_FAILED);
      soundManager.playLevelFailed();
      return;
    }

    // Advance queue now that the shot has safely resolved
    const colors = store.level?.colors || ['red', 'blue', 'green'];
    const nextGenerated = colors[Math.floor(Math.random() * colors.length)];
    useGameStore.setState({
      currentBubble: store.nextBubble,
      nextBubble: { color: nextGenerated, special: null },
      activeBooster: null,
    });

    if (this.currentBubbleSprite) {
      this.currentBubbleSprite.setVisible(true);
      this.updateCurrentBubbleSprite();
    }
    if (this.nextBubbleSprite) {
      this.updateNextBubbleSprite();
    }

    store.setGameStatus(GAME_STATUS.READY);
  }

  shutdown() {
    if (this.unsubscribeStore) this.unsubscribeStore();
  }
}

export function createGameConfig(parentContainerId) {
  return {
    type: Phaser.AUTO,
    width: 480,
    height: 680,
    parent: parentContainerId,
    backgroundColor: '#0b1120',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { debug: false },
    },
    scene: [BubbleShooterScene],
  };
}
