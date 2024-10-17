import { Position } from './astar-finder';

export class Tile {
    
    public fValue: number;
    public gValue: number;
    public hValue: number;

    public cameFrom: Tile;

    public isOnOpenList: boolean;
    public isOnClosedList: boolean;
    
    constructor(public xPos: number, public yPos:number, public isWalkable = true) {

    }

    private calculateFValue(): void {
        this.fValue = this.gValue + this.hValue;
    }

    public setGValue(gValue: number) {
        this.gValue = gValue;
        
        this.calculateFValue();
    }

    public setHValue(hValue: number) {
        this.hValue = hValue;
        this.calculateFValue();
    }

    public setFGHValuesToZero() {
        this.fValue = this.gValue = this.gValue = 0;
        this.isOnClosedList = false;
        this.isOnOpenList = false;

    }
    get position(): Position {
        return [this.xPos, this.yPos];
    }
}