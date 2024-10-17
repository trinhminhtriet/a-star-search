import { Grid } from './grid';
import { Tile } from './tile';
import { MinHeap } from '../utils/min-heap';

export type Position = [number, number];
export enum TileType {
  EMPTY, START, GOAL, OBSTACLE, CURRENT, EXPLORING, EXPLORED
}

export function calculateHeuristic(from: Position, to: Position, type: 'Euclidean' | 'Manhattan' = 'Euclidean') {
  let dx = Math.abs(from[0] - to[0]);
  let dy = Math.abs(from[1] - to[1]);

  return type === 'Euclidean' ? Math.sqrt(dx * dx + dy * dy) : dx + dy;
}


export interface FindingState {
  hasReachedGoal: boolean,
  currentTile: Tile,
  map: number[][];
}

export class AStarFinder {

  constructor(public grid: Grid, private diagonalAllowed: boolean = true, private heuristicFunction: any) {

  }


  private buildFindingState(grid: Grid, current: Tile, openList: Tile[], closedList: Tile[], neighbors: Tile[], hasReachedGoal = false): FindingState {
    const { col, row } = grid;
    const map = Array(row).fill(null).map(x => Array(col).fill(TileType.EMPTY));



    const exploring = neighbors;
    const explored = [...openList, ...closedList].map(tile => ([tile.xPos, tile.yPos] as Position));



    for (let j = 0; j < explored.length; j++) {
      const [xPos, yPos] = explored[j];
      map[xPos][yPos] = TileType.EXPLORED;
    }

    map[current.xPos][current.yPos] = TileType.CURRENT;

    for (let i = 0; i < exploring.length; i++) {
      const { xPos, yPos } = exploring[i];
      map[xPos][yPos] = TileType.EXPLORING;
    }
    // assign obstacle
    for (let i = 0; i < row; i++) {
      for (let j = 0; j < col; j++) {

        if (!grid.getTileAt([i, j]).isWalkable) {
          map[i][j] = TileType.OBSTACLE;
        }
      }
    }

    return {
      hasReachedGoal,
      map,
      currentTile: current
    }
  }

  public findPath(start: Position, end: Position): FindingState[] {
    const findingStates: FindingState[] = [];

    const closedList = [];
    const openList = new MinHeap<Tile>((a, b) => a.fValue - b.fValue);

    let startTile = this.grid.getTileAt(start);
    let endTile = this.grid.getTileAt(end);

    // Push start node to open list
    startTile.isOnOpenList = true;
    openList.add(startTile);

    // Loop through the grid, set FGH value of non-walkable nodes to zero and push them on the closed list
    // set the H value for walked nodes
    for (let x = 0; x < this.grid.row; x++) {
      for (let y = 0; y < this.grid.col; y++) {
        let tile = this.grid.getTileAt([x, y]);
        tile.setFGHValuesToZero();
        if (!tile.isWalkable) {
          // tile.isOnClosedList = true;
          // closedList.push(tile);
        } else {
          const hValue = calculateHeuristic(tile.position, end, this.heuristicFunction);
          tile.setHValue(hValue)
        }
      }
    }

    // Loop until open list is empty
    while (openList.size() !== 0) {

      let currentNode = openList.extractRoot();
      // move current node from open list to closed list
      currentNode.isOnOpenList = false;
      currentNode.isOnClosedList = true;
      closedList.push(currentNode);

      if (currentNode === endTile) {
        const state = this.buildFindingState(this.grid, currentNode, [], [], [], true);
        findingStates.push(state);
        return findingStates;
        //return backtrace(endTile, true, true);
      }

      // Get neighbors, already filterd non-walkable position
      let neighbors = this.grid.getNeighbors(currentNode.position, this.diagonalAllowed);
      console.log(this.diagonalAllowed);
      const exploring = [];
      // Loop through all the neighbors
      for (let i = 0; i < neighbors.length; i++) {
        const n = neighbors[i];
        const neighbor = this.grid.getTileAt([n[0], n[1]]);

        // continue of node on closed list
        if (neighbor.isOnClosedList || neighbor.isOnOpenList) {
          continue;
        }

        // calculate the G value of the neighbor
        //const distance = (Math.abs(currentNode.xPos - neighbor.xPos) + Math.abs(currentNode.yPos - neighbor.yPos)) === 2 ? 1.41421 : 1;
        const distance = 1;
        const nextGValue = currentNode.gValue + distance;


        // prevent backtrace
        if (neighbor.isOnOpenList && nextGValue > neighbor.gValue) {
          continue;
        }

        neighbor.setGValue(nextGValue);
        neighbor.cameFrom = currentNode;
        // Add neighbor to the open list
        neighbor.isOnOpenList = true;
        openList.add(neighbor);

        exploring.push(neighbor);
      }

      if (exploring.length > 0) {
        const state = this.buildFindingState(this.grid, currentNode, openList.data, closedList, exploring);
        findingStates.push(state);
      }

    }

    console.log('Path could not be created. Outside while loop');
    return findingStates;
  }


  backtrace(tile: Tile, includeStartTile: boolean, includeEndTile: boolean): Position[] {
    let path: Position[] = [];
    let currentTile = includeEndTile ? tile : tile.cameFrom;

    // tracing back until start
    while (currentTile.cameFrom) {
      path.push([currentTile.xPos, currentTile.yPos]);
      currentTile = currentTile.cameFrom;
    }

    if (includeStartTile) {
      path.push([currentTile.xPos, currentTile.yPos])
    }

    return path.reverse();

  }

}
