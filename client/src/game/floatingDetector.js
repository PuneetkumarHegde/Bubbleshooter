// Multi-Source BFS Floating Bubble Detection
// Finds all active bubbles not tethered to ceiling row 0

export class FloatingDetector {
  constructor(hexGrid) {
    this.hexGrid = hexGrid;
  }

  // Returns array of { row, col, bubble } for all floating/disconnected bubbles
  findFloatingBubbles(board) {
    const connected = new Set();
    const queue = [];

    // Seed queue with all active bubbles in top ceiling row (row 0)
    if (board[0]) {
      for (let c = 0; c < board[0].length; c++) {
        const bubble = board[0][c];
        if (bubble && !bubble.isPopped) {
          queue.push({ row: 0, col: c });
          connected.add(`0,${c}`);
        }
      }
    }

    // Traverse outward to all tethered neighbors
    while (queue.length > 0) {
      const current = queue.shift();
      const neighbors = this.hexGrid.getNeighbors(current.row, current.col);

      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        if (!connected.has(key)) {
          const neighborBubble = board[n.row] && board[n.row][n.col];
          if (neighborBubble && !neighborBubble.isPopped) {
            connected.add(key);
            queue.push(n);
          }
        }
      }
    }

    // Any remaining active bubble that was not reached is disconnected/floating!
    const floating = [];
    for (let r = 0; r < board.length; r++) {
      if (!board[r]) continue;
      for (let c = 0; c < board[r].length; c++) {
        const bubble = board[r][c];
        if (bubble && !bubble.isPopped) {
          const key = `${r},${c}`;
          if (!connected.has(key)) {
            floating.push({ row: r, col: c, bubble });
          }
        }
      }
    }

    return floating;
  }
}
