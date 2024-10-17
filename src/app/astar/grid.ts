import { Tile } from './tile';
import { Position } from './astar-finder';

export interface GridContructorConfig {
  col: number;
  row: number;
  densityOfObstacles: number;
}

type IGridContructor = GridContructorConfig | number[][];
export class Grid {

  public col: number;
  public row: number;

  public grid: Tile[][] = [];

  public start: Position;
  public goal: Position;
  constructor(params: IGridContructor) {
    Array.isArray(params) ? this.initGridFromMatrix(params) : this.initGridFromConfig(params);

    this.setStart([0, 0]);
    this.setGoal([this.row - 1, this.col - 1]);

  }
  private initGridFromConfig(config: GridContructorConfig) {
    const { col, row, densityOfObstacles } = config;
    this.col = col;
    this.row = row;
    this.grid = Array(row).fill(null).map(x => Array(col).fill(null));
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {
        const isWalkable = Math.random() > densityOfObstacles;
        this.grid[i][j] = new Tile(i, j, isWalkable)
      }
    }
  }
  private initGridFromMatrix(matrix: number[][]) {
    this.row = matrix.length;
    this.col = matrix[0].length;
    this.grid = Array(this.row).fill(null).map(x => Array(this.col).fill(null));
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        this.grid[i][j] = new Tile(i, j, matrix[i][j] == 0)
      }
    }
  }

  public setStart(start: Position) {
    this.start = start;
    this.grid[start[0]][start[1]].isWalkable = true;
  }

  public setGoal(goal: Position) {
    this.goal = goal;
    this.grid[goal[0]][goal[1]].isWalkable = true;
  }



  toString(): string {
    let result = '';
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < this.col; j++) {
        const tile = this.grid[i][j];
        result += tile.isWalkable ? ' .' : ' x';
      }
      result += '\n';
    }
    return result;
  }

  getTileAt([x, y]: [number, number]): Tile {
    if (this.grid[x] === undefined) {
      console.log(`x=${x}, y= ${y}`);
    }
    return this.grid[x][y]
  }

  /**
   *
   * @param position Position on the grid
   * @param diagonalAllowed is diagnonal movement allowed?
   */
  getNeighbors(position: Position, diagonalAllowed: boolean = true) {
    let deltas = [[-1, -1], [-1, 0], [-1, + 1], [0, +1], [+1, +1], [+1, 0], [+1, -1], [0, -1]];
    const neighbors = deltas
      .filter(([dx, dy]) => {
        return diagonalAllowed || (Math.abs(dx) + Math.abs(dy)) < 2;
      })
      .map(([dx, dy]) => [position[0] + dx, position[1] + dy] as Position)
      .filter(([x, y]) => {
        // check position is out of grid
        if (x < 0 || x > this.row - 1) {
          return false;
        }

        if (y < 0 || y > this.col - 1) {
          return false;
        }

        // inside tile
        return true;
      })
      .filter(([x, y]) => this.grid[x][y].isWalkable);
    return neighbors;
  }
}

export class TestConstructor {
  constructor(public value: number) {
    if (value === 5) {
      throw new Error('error here');
    }
  }
}
