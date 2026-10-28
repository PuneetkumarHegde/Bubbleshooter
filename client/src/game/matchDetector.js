// BFS Connected Component Match Detector for Hexagonal Bubble Grid

export class MatchDetector {
  constructor(hexGrid) {
    this.hexGrid = hexGrid;
  }

  // Find all connected bubbles of the same color starting at (startRow, startCol)
  findMatches(startRow, startCol, board, specialType = null) {
    if (!board[startRow] || !board[startRow][startCol]) {
      return { matches: [], isBomb: false, isSpecial: false };
    }

    const startBubble = board[startRow][startCol];
    const targetColor = startBubble.color;
    const special = specialType || startBubble.special;

    // Handle Bomb Booster: Explodes adjacent radius
    if (special === 'bomb') {
      const bombPops = [{ row: startRow, col: startCol, bubble: startBubble }];
      const directNeighbors = this.hexGrid.getNeighbors(startRow, startCol);
      const visited = new Set([`${startRow},${startCol}`]);

      for (const n of directNeighbors) {
        if (!visited.has(`${n.row},${n.col}`)) {
          visited.add(`${n.row},${n.col}`);
          if (board[n.row] && board[n.row][n.col] && !board[n.row][n.col].isPopped) {
            bombPops.push({ row: n.row, col: n.col, bubble: board[n.row][n.col] });
          }
          // Secondary ring for satisfying bomb blast
          const secondRing = this.hexGrid.getNeighbors(n.row, n.col);
          for (const s of secondRing) {
            if (!visited.has(`${s.row},${s.col}`)) {
              visited.add(`${s.row},${s.col}`);
              if (board[s.row] && board[s.row][s.col] && !board[s.row][s.col].isPopped) {
                bombPops.push({ row: s.row, col: s.col, bubble: board[s.row][s.col] });
              }
            }
          }
        }
      }
      return { matches: bombPops, isBomb: true, isSpecial: true };
    }

    // Handle Rainbow Booster: Wildcard that matches any adjacent color
    if (special === 'rainbow') {
      const neighbors = this.hexGrid.getNeighbors(startRow, startCol);
      let bestCluster = [];
      const checkedColors = new Set();

      for (const n of neighbors) {
        if (board[n.row] && board[n.row][n.col] && !board[n.row][n.col].isPopped) {
          const adjColor = board[n.row][n.col].color;
          if (!checkedColors.has(adjColor)) {
            checkedColors.add(adjColor);
            const cluster = this.bfsMatch(n.row, n.col, board, adjColor);
            if (cluster.length > bestCluster.length) {
              bestCluster = cluster;
            }
          }
        }
      }

      bestCluster.push({ row: startRow, col: startCol, bubble: startBubble });
      return {
        matches: bestCluster.length >= 3 ? bestCluster : [bestCluster[bestCluster.length - 1]],
        isRainbow: true,
        isSpecial: true,
      };
    }

    // Standard BFS Color Matching
    const matches = this.bfsMatch(startRow, startCol, board, targetColor);

    return {
      matches: matches.length >= 3 ? matches : [],
      isBomb: false,
      isSpecial: false,
    };
  }

  bfsMatch(startRow, startCol, board, targetColor) {
    const queue = [{ row: startRow, col: startCol }];
    const visited = new Set([`${startRow},${startCol}`]);
    const matches = [];

    while (queue.length > 0) {
      const current = queue.shift();
      const bubble = board[current.row] && board[current.row][current.col];
      if (!bubble || bubble.isPopped) continue;

      matches.push({ row: current.row, col: current.col, bubble });

      const neighbors = this.hexGrid.getNeighbors(current.row, current.col);
      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(key)) {
          visited.add(key);
          const nBubble = board[neighbor.row] && board[neighbor.row][neighbor.col];
          if (nBubble && !nBubble.isPopped) {
            // Same color or adjacent rainbow bubble
            if (nBubble.color === targetColor || nBubble.special === 'rainbow') {
              queue.push(neighbor);
            }
          }
        }
      }
    }

    return matches;
  }
}
