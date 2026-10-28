// Hexagonal Grid Geometry and Physics Collision System
import { GAME_CONSTANTS } from '../config/gameConfig';

export class HexGrid {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.radius = GAME_CONSTANTS.BUBBLE_RADIUS;
    this.diameter = this.radius * 2;
    // Hexagonal vertical step: height = radius * sqrt(3) ~ 41.57px
    this.rowHeight = this.radius * Math.sqrt(3);
    this.cols = GAME_CONSTANTS.GRID_COLS;
    this.rows = GAME_CONSTANTS.GRID_ROWS;

    // Calculate left padding so grid is horizontally centered
    const gridPixelWidth = this.cols * this.diameter;
    this.offsetX = Math.max(0, (this.canvasWidth - gridPixelWidth) / 2) + this.radius;
    this.offsetY = this.radius + 8; // small ceiling margin
  }

  // Convert (row, col) to canvas (x, y) coordinates
  gridToPixel(row, col) {
    const isOdd = row % 2 !== 0;
    const x = this.offsetX + col * this.diameter + (isOdd ? this.radius : 0);
    const y = this.offsetY + row * this.rowHeight;
    return { x, y };
  }

  // Convert canvas (x, y) to closest (row, col)
  pixelToGrid(x, y) {
    const row = Math.round((y - this.offsetY) / this.rowHeight);
    if (row < 0) return { row: 0, col: 0 };
    const isOdd = row % 2 !== 0;
    const colX = x - this.offsetX - (isOdd ? this.radius : 0);
    const col = Math.round(colX / this.diameter);
    const maxCols = isOdd ? this.cols - 1 : this.cols;
    const clampedCol = Math.max(0, Math.min(maxCols - 1, col));
    return { row: Math.max(0, row), col: clampedCol };
  }

  // Get neighboring coordinates for a cell (hexagonal adjacency)
  getNeighbors(row, col) {
    const isOdd = row % 2 !== 0;
    const offsets = isOdd
      ? [
          { r: 0, c: -1 }, // Left
          { r: 0, c: 1 },  // Right
          { r: -1, c: 0 }, // Up-Left
          { r: -1, c: 1 }, // Up-Right
          { r: 1, c: 0 },  // Down-Left
          { r: 1, c: 1 },  // Down-Right
        ]
      : [
          { r: 0, c: -1 }, // Left
          { r: 0, c: 1 },  // Right
          { r: -1, c: -1 },// Up-Left
          { r: -1, c: 0 }, // Up-Right
          { r: 1, c: -1 }, // Down-Left
          { r: 1, c: 0 },  // Down-Right
        ];

    const neighbors = [];
    for (const offset of offsets) {
      const nr = row + offset.r;
      const nc = col + offset.c;
      const maxCols = nr % 2 !== 0 ? this.cols - 1 : this.cols;
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < maxCols) {
        neighbors.push({ row: nr, col: nc });
      }
    }
    return neighbors;
  }

  // Check if moving bubble collides with any bubble on the board
  checkCollision(bubbleX, bubbleY, board) {
    const collisionDist = this.radius * 1.85; // slight tolerance for smooth snapping
    for (let r = 0; r < board.length; r++) {
      if (!board[r]) continue;
      for (let c = 0; c < board[r].length; c++) {
        const target = board[r][c];
        if (target && !target.isPopped) {
          const { x, y } = this.gridToPixel(r, c);
          const dx = bubbleX - x;
          const dy = bubbleY - y;
          const dist = Math.hypot(dx, dy);
          if (dist <= collisionDist) {
            return { hit: true, targetRow: r, targetCol: c, targetBubble: target };
          }
        }
      }
    }
    return { hit: false };
  }

  // Find optimal empty adjacent slot to attach the collided bubble
  findSnapPosition(bubbleX, bubbleY, board) {
    // If reached ceiling, snap directly to row 0
    if (bubbleY <= this.offsetY + this.radius * 0.5) {
      const isOdd = 0;
      const colX = bubbleX - this.offsetX;
      let col = Math.round(colX / this.diameter);
      col = Math.max(0, Math.min(this.cols - 1, col));
      if (!board[0]) board[0] = [];
      if (!board[0][col]) return { row: 0, col };
    }

    // Otherwise find closest empty neighbor to current coordinates
    let bestSlot = null;
    let minDistance = Infinity;

    for (let r = 0; r < this.rows; r++) {
      const isOdd = r % 2 !== 0;
      const maxCols = isOdd ? this.cols - 1 : this.cols;
      for (let c = 0; c < maxCols; c++) {
        const occupied = board[r] && board[r][c] && !board[r][c].isPopped;
        if (!occupied) {
          // Check if slot has at least one neighbor or is top row (valid anchor)
          const neighbors = this.getNeighbors(r, c);
          const hasNeighbor = r === 0 || neighbors.some(n => board[n.row] && board[n.row][n.col] && !board[n.row][n.col].isPopped);
          if (hasNeighbor) {
            const { x, y } = this.gridToPixel(r, c);
            const dist = Math.hypot(bubbleX - x, bubbleY - y);
            if (dist < minDistance) {
              minDistance = dist;
              bestSlot = { row: r, col: c };
            }
          }
        }
      }
    }

    if (bestSlot) return bestSlot;

    // Fallback directly to closest grid cell
    return this.pixelToGrid(bubbleX, bubbleY);
  }
}
