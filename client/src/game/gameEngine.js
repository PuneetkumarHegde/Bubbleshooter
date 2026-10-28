// Phaser 3 Bubble Shooter Game Engine
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

    // Scene groups and containers
    this.bubbleSprites = new Map(); // key "r,c" -> Phaser.GameObjects.Sprite
    this.trajectoryGraphics = this.add.graphics().setDepth(5);
    this.effectsContainer = this.add.container(0, 0).setDepth(20);

    // Launcher setup
    this.launcherX = this.canvasWidth / 2;
    this.launcherY = this.canvasHeight - 65;
    this.aimAngle = -Math.PI / 2;
    this.isAiming = false;
    this.movingBubble = null;

    this.createLauncher();
    this.setupInputHandlers();

    // Sync with Zustand store
    const store = useGameStore.getState();
    this.initLevel(store.level);

    // Subscribe to store updates (boosters, restart, etc.)
    this.unsubscribeStore = useGameStore.subscribe((state, prevState) => {
      if (state.gameStatus === GAME_STATUS.READY && prevState.gameStatus === GAME_STATUS.LOADING) {
        this.initLevel(state.level);
      }
      if (state.currentBubble !== prevState.currentBubble) {
        this.updateCurrentBubbleSprite();
      }
    });
  }

  // Generates high-gloss, cartoonish vector bubble textures in memory
  createProceduralTextures() {
    const colors = {
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#10b981',
      yellow: '#f59e0b',
      purple: '#8b5cf6',
      orange: '#f97316',
      pink: '#ec4899',
      cyan: '#06b6d4',
    };

    const r = GAME_CONSTANTS.BUBBLE_RADIUS;
    const d = r * 2;

    // Normal color bubbles
    Object.entries(colors).forEach(([name, hex]) => {
      if (this.textures.exists(`bubble_${name}`)) return;
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');

      // Base radial shading
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.7, r * 0.1, r, r, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, hex);
      grad.addColorStop(0.85, hex);
      grad.addColorStop(1, '#0f172a');

      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Outer glassy rim
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.stroke();

      // Glossy shine reflection
      ctx.beginPath();
      ctx.ellipse(r * 0.65, r * 0.55, r * 0.35, r * 0.2, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fill();

      this.textures.addCanvas(`bubble_${name}`, canvas);
    });

    // Bomb Bubble Texture
    if (!this.textures.exists('bubble_bomb')) {
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.7, r * 0.1, r, r, r);
      grad.addColorStop(0, '#fca5a5');
      grad.addColorStop(0.5, '#dc2626');
      grad.addColorStop(1, '#450a0a');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      // Draw fuse spark
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💣', r, r);
      this.textures.addCanvas('bubble_bomb', canvas);
    }

    // Rainbow Bubble Texture
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
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🌈', r, r);
      this.textures.addCanvas('bubble_rainbow', canvas);
    }

    // Rescue Star Sprite Bubble
    if (!this.textures.exists('bubble_rescue')) {
      const canvas = document.createElement('canvas');
      canvas.width = d;
      canvas.height = d;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(r * 0.7, r * 0.7, r * 0.1, r, r, r);
      grad.addColorStop(0, '#fef08a');
      grad.addColorStop(0.4, '#eab308');
      grad.addColorStop(1, '#713f12');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.font = '22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⭐', r, r);
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
      grad.addColorStop(0.4, '#c084fc');
      grad.addColorStop(1, '#581c87');
      ctx.beginPath();
      ctx.arc(r, r, r - 2, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.font = '20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🎯', r, r);
      this.textures.addCanvas('bubble_target', canvas);
    }

    // Trajectory dot particle
    if (!this.textures.exists('dot_particle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 12;
      canvas.height = 12;
      const ctx = canvas.getContext('2d');
      ctx.beginPath();
      ctx.arc(6, 6, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      this.textures.addCanvas('dot_particle', canvas);
    }
  }

  createLauncher() {
    // Pedestal base
    this.launcherBase = this.add.circle(this.launcherX, this.launcherY + 22, 38, 0x1e293b).setDepth(8);
    this.launcherBase.setStrokeStyle(3, 0x6366f1);

    // Aim guide cannon arrow
    this.launcherArrow = this.add.triangle(this.launcherX, this.launcherY, 0, 18, 12, -26, 24, 18, 0x818cf8).setDepth(9);
    this.launcherArrow.setOrigin(0.5, 0.7);

    // Current bubble in launcher
    this.currentBubbleSprite = this.add.sprite(this.launcherX, this.launcherY, 'bubble_blue').setDepth(10);
    this.currentBubbleSprite.setScale(1.05);

    // Helper Character Avatar in bottom left
    this.helperCharacter = this.add.text(48, this.canvasHeight - 48, '🐲', {
      fontSize: '42px',
    }).setOrigin(0.5).setDepth(10);

    // Gentle breathing tween for character
    this.tweens.add({
      targets: this.helperCharacter,
      scaleX: 1.15,
      scaleY: 0.9,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
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
  }

  createBubbleSprite(r, c, cell) {
    const { x, y } = this.hexGrid.gridToPixel(r, c);
    let textureKey = `bubble_${cell.color}`;
    if (cell.special === 'bomb') textureKey = 'bubble_bomb';
    else if (cell.special === 'rainbow') textureKey = 'bubble_rainbow';
    else if (cell.isRescue) textureKey = 'bubble_rescue';
    else if (cell.isTarget) textureKey = 'bubble_target';

    const sprite = this.add.sprite(x, y, textureKey).setDepth(2);
    // Pop-in entry animation
    sprite.setScale(0);
    this.tweens.add({
      targets: sprite,
      scale: 1,
      duration: 250 + r * 25,
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
        // Fire bubble if pointer is inside upper play area
        if (pointer.y < this.canvasHeight - 100) {
          this.shootBubble();
        }
      }
    });

    // Space key to swap bubbles
    this.input.keyboard.on('keydown-SPACE', () => {
      useGameStore.getState().swapBubbles();
      soundManager.playAim();
    });

    // R key to restart level
    this.input.keyboard.on('keydown-R', () => {
      const store = useGameStore.getState();
      if (store.level) store.setLevel(store.level);
    });
  }

  handleAim(targetX, targetY) {
    const dx = targetX - this.launcherX;
    const dy = targetY - this.launcherY;

    // Constrain angle so player cannot shoot downwards
    let angle = Math.atan2(dy, dx);
    const minAngle = -Math.PI + 0.18; // approx 170 deg
    const maxAngle = -0.18; // approx 10 deg

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
    const store = useGameStore.getState();
    const hasAimGuide = store.activeBooster === 'aimGuide';

    let currentX = this.launcherX;
    let currentY = this.launcherY;
    let vx = Math.cos(this.aimAngle);
    let vy = Math.sin(this.aimAngle);

    const step = 14;
    const maxSteps = hasAimGuide ? 75 : 32;
    const radius = GAME_CONSTANTS.BUBBLE_RADIUS;
    const board = store.board;

    this.trajectoryGraphics.fillStyle(0xffffff, 0.7);

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
        // Draw impact ring target
        this.trajectoryGraphics.lineStyle(2, 0xf59e0b, 0.9);
        this.trajectoryGraphics.strokeCircle(currentX, currentY, radius);
        break;
      }

      // Draw dashed trajectory dot
      if (i % 2 === 0) {
        const alpha = 1.0 - (i / maxSteps) * 0.7;
        this.trajectoryGraphics.fillStyle(0xffffff, alpha);
        this.trajectoryGraphics.fillCircle(currentX, currentY, 3.5);
      }
    }
  }

  shootBubble() {
    const store = useGameStore.getState();
    if (store.gameStatus !== GAME_STATUS.READY && store.gameStatus !== GAME_STATUS.AIMING) return;
    if (store.shotsRemaining <= 0) return;

    // Save snapshot for Undo
    store.saveHistorySnapshot();

    // Prevent double shooting by transitioning state
    store.setGameStatus(GAME_STATUS.SHOOTING);
    store.decrementShots();
    this.trajectoryGraphics.clear();

    const current = store.currentBubble;
    let textureKey = `bubble_${current.color}`;
    if (current.special === 'bomb') textureKey = 'bubble_bomb';
    else if (current.special === 'rainbow') textureKey = 'bubble_rainbow';

    this.movingBubble = {
      sprite: this.add.sprite(this.launcherX, this.launcherY, textureKey).setDepth(15),
      x: this.launcherX,
      y: this.launcherY,
      vx: Math.cos(this.aimAngle) * GAME_CONSTANTS.BUBBLE_SPEED,
      vy: Math.sin(this.aimAngle) * GAME_CONSTANTS.BUBBLE_SPEED,
      color: current.color,
      special: current.special,
    };

    soundManager.playLaunch();

    // Launcher recoil animation
    this.tweens.add({
      targets: this.launcherBase,
      scale: 0.88,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeInOut',
    });

    // Advance bubble queue in store
    const colors = store.level.colors || ['red', 'blue', 'green'];
    const nextGenerated = colors[Math.floor(Math.random() * colors.length)];
    useGameStore.setState({
      currentBubble: store.nextBubble,
      nextBubble: { color: nextGenerated, special: null },
      activeBooster: null,
    });
    this.updateCurrentBubbleSprite();
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

    // Collision checks
    const store = useGameStore.getState();
    const board = store.board;
    const colCheck = this.hexGrid.checkCollision(mb.x, mb.y, board);
    const hitCeiling = mb.y <= this.hexGrid.offsetY + radius * 0.5;

    if (colCheck.hit || hitCeiling) {
      this.resolveCollision(mb);
      this.movingBubble = null;
    }
  }

  resolveCollision(mb) {
    const store = useGameStore.getState();
    store.setGameStatus(GAME_STATUS.RESOLVING);

    const slot = this.hexGrid.findSnapPosition(mb.x, mb.y, store.board);
    mb.sprite.destroy();

    // Add to board array
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

    // Create visual bubble sprite at snapped slot
    const sprite = this.createBubbleSprite(slot.row, slot.col, board[slot.row][slot.col]);
    soundManager.playCollision();

    // Bounce impact ripple animation
    this.tweens.add({
      targets: sprite,
      scaleX: 1.25,
      scaleY: 0.85,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeInOut',
      onComplete: () => {
        this.processMatchesAndFalls(slot.row, slot.col, mb.special);
      },
    });
  }

  processMatchesAndFalls(row, col, specialType) {
    const store = useGameStore.getState();
    const board = store.board;

    const { matches, isBomb, isRainbow } = this.matchDetector.findMatches(row, col, board, specialType);
    let poppedCount = 0;
    let rescuedCount = 0;

    if (matches.length >= 3 || isBomb) {
      poppedCount = matches.length;
      store.incrementCombo();
      const currentCombo = useGameStore.getState().combo;

      if (isBomb) {
        soundManager.playBomb();
        this.createExplosionEffect(row, col);
      } else {
        soundManager.playMultiPop(poppedCount);
        if (currentCombo >= 2) soundManager.playCombo(currentCombo);
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

      // Detect floating bubbles
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

  animatePop(sprite, colorHex, r, c) {
    this.tweens.add({
      targets: sprite,
      scale: 1.35,
      alpha: 0,
      duration: 180,
      ease: 'Back.easeIn',
      onComplete: () => sprite.destroy(),
    });

    // Particle burst
    for (let i = 0; i < 6; i++) {
      const p = this.add.circle(sprite.x, sprite.y, 4, 0xffffff).setDepth(25);
      const angle = (Math.PI * 2 / 6) * i + Math.random() * 0.4;
      const dist = 30 + Math.random() * 20;
      this.tweens.add({
        targets: p,
        x: sprite.x + Math.cos(angle) * dist,
        y: sprite.y + Math.sin(angle) * dist,
        alpha: 0,
        scale: 0.2,
        duration: 350,
        ease: 'Quad.easeOut',
        onComplete: () => p.destroy(),
      });
    }
  }

  animateFall(sprite, delay) {
    this.tweens.add({
      targets: sprite,
      y: this.canvasHeight + 50,
      rotation: Math.PI + Math.random() * 2,
      alpha: 0.6,
      delay,
      duration: 550,
      ease: 'Cubic.easeIn',
      onComplete: () => sprite.destroy(),
    });
  }

  createExplosionEffect(r, c) {
    const { x, y } = this.hexGrid.gridToPixel(r, c);
    const shockwave = this.add.circle(x, y, 10, 0xf97316, 0.8).setDepth(26);
    this.tweens.add({
      targets: shockwave,
      radius: 90,
      alpha: 0,
      duration: 320,
      ease: 'Quad.easeOut',
      onComplete: () => shockwave.destroy(),
    });
  }

  showScoreFloater(x, y, text, combo) {
    const color = combo >= 3 ? '#fbbf24' : '#ffffff';
    const msg = combo >= 2 ? `${text} (x${combo})` : text;
    const floater = this.add.text(x, y, msg, {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: combo >= 3 ? '28px' : '22px',
      fontStyle: 'bold',
      color,
      stroke: '#0f172a',
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(30);

    this.tweens.add({
      targets: floater,
      y: y - 45,
      alpha: 0,
      duration: 650,
      ease: 'Quad.easeOut',
      onComplete: () => floater.destroy(),
    });
  }

  showRescueCelebration() {
    const banner = this.add.text(this.canvasWidth / 2, 220, '🎉 SPRITE RESCUED! 🎉', {
      fontFamily: 'Fredoka, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#fbbf24',
      stroke: '#451a03',
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(35).setScale(0.2);

    this.tweens.add({
      targets: banner,
      scale: 1.1,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: banner,
          alpha: 0,
          y: 190,
          delay: 400,
          duration: 300,
          onComplete: () => banner.destroy(),
        });
      },
    });
  }

  checkGameEnd(isObjectiveCompleted) {
    const store = useGameStore.getState();

    if (isObjectiveCompleted) {
      // Award final leftover shots bonus
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

    // Ready for next shot
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
    backgroundColor: '#0f172a',
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
