import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Grid } from './astar/grid';
import { AStarFinder, Position, FindingState, TileType } from './astar/astar-finder';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit {
  title = 'A* Demo';
  mapOptForm: FormGroup;
  algOptForm: FormGroup;

  grid: Grid;

  // save position due to angular loop in template
  col: number[];
  row: number[];

  results: FindingState[] = [];

  displayedGrid: number[][];

  animationInterval: any;

  backtrace = [];
  backTraceAnimationInterval: any;
  backtraceAnimationIndex = -1;
  startAnimationIndex = -1;

  // ui
  disabledFindPathBtn = false;
  constructor(private fb: FormBuilder, private changeDetectorRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.buildForm();
    this.onGenrationOptSubmit();
  }

  private buildForm() {
    const defaultValue = {
      col: 30,
      row: 25,
      allowDiagonalMove: true,
      obstacleDensity: 0.2,
      heuristicFunction: 'Euclidean',
      setPoint: 'start'
    };
    const { col, row, obstacleDensity, allowDiagonalMove, heuristicFunction, setPoint } = defaultValue;
    this.mapOptForm = this.fb.group({
      col: [col, Validators.required],
      row: [row, Validators.required],
      obstacleDensity: [obstacleDensity, Validators.required]
    });

    this.algOptForm = this.fb.group({
      setPoint: [setPoint, Validators.required],
      heuristicFunction: [heuristicFunction, Validators.required],
      allowDiagonalMove: [allowDiagonalMove, Validators.required],
    });

    this.algOptForm.controls['allowDiagonalMove'].valueChanges.subscribe(value => {
      console.log(value);
      if (!value) {
        this.algOptForm.patchValue({
          heuristicFunction: 'Manhattan'
        })
      }
    })
  }
  onGenrationOptSubmit() {
    let { col, row, obstacleDensity } = this.mapOptForm.value;

    col = parseInt(col, 10);
    row = parseInt(row, 10);

    
    // fixed data

    // let matrix = [
    //   [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    //   [0, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    //   [1, 0, 1, 0, 0, 0, 0, 1, 0, 0],
    //   [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    //   [0, 0, 1, 0, 0, 1, 0, 0, 0, 0],
    //   [0, 0, 0, 0, 0, 1, 0, 0, 1, 0],
    //   [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    // ];

    // this.grid = new Grid(matrix);

    this.grid = new Grid({
      col,
      row,
      densityOfObstacles: obstacleDensity,
    });


    this.col = Array(this.grid.col).fill(null).map((x, i) => i);
    this.row = Array(this.grid.row).fill(null).map((x, i) => i);

    this.resetAnimation();
  }



  findPath() {
    this.disabledFindPathBtn = true;
    const { allowDiagonalMove, heuristicFunction } = this.algOptForm.value;
    console.log('diagoinal');
    console.log(allowDiagonalMove);
    const finder = new AStarFinder(this.grid, allowDiagonalMove, heuristicFunction);
    this.results = finder.findPath(this.grid.start, this.grid.goal);
    if (this.results.length === 0 || this.results[this.results.length - 1].hasReachedGoal === false) {
      alert('Path cannot be found');
      this.disabledFindPathBtn = false;
      return;
    }

    this.backtrace = finder.backtrace(this.results[this.results.length - 1].currentTile, true, true);

    this.startAnimationIndex = 0;
    this.animationInterval = setInterval(() => {
      this.findPathNext();
    }, 100);

  }



  findPathNext() {

    if (this.startAnimationIndex < this.results.length - 1) {
      this.startAnimationIndex++;
      this.changeDetectorRef.detectChanges();
    } else {
      clearInterval(this.animationInterval);
      // start backtrace
      this.startAnimationIndex = -1;
      this.backtraceAnimationIndex = 0;
      this.backTraceAnimationInterval = setInterval(() => {
        this.showBackTrace();
      }, 100)
    }
  }



  showBackTrace() {
    if (this.backtraceAnimationIndex < this.backtrace.length) {
      this.backtraceAnimationIndex++;
      this.changeDetectorRef.detectChanges();
    } else {
      clearInterval(this.backTraceAnimationInterval);
      this.disabledFindPathBtn = false;
    }
  }



  getTileClasses(x, y) {

    const result = [];
    const { setPoint } = this.algOptForm.value;
    if (this.grid.start[0] === x && this.grid.start[1] === y) {
      result.push('start');
    } else if (this.grid.goal[0] === x && this.grid.goal[1] === y) {
      result.push('goal');
    }

    if (!this.grid.getTileAt([x, y]).isWalkable) {
      result.push('obstacle')
    }

    if (setPoint === 'start') {
      result.push('start-hover')
    } else {
      result.push('goal-hover')
    }

    if (this.startAnimationIndex !== -1) {
      const state = this.results[this.startAnimationIndex];
      const map = state.map;
      const code = map[x][y];
      if (code === TileType.CURRENT) {
        result.push('current');
      } else if (code === TileType.EXPLORED) {
        result.push('explored');
      } else if (code == TileType.EXPLORING) {
        result.push('exploring')
      }
    }

    if (this.backtraceAnimationIndex !== -1) {
      const isPath = (element: Position) => (element[0] === x && element[1] === y)
      if (this.backtrace.slice(0, this.backtraceAnimationIndex).some(isPath)) {
        result.push('path')
      }
    }

    return result;
  }
  tileOnClickHandler(x, y) {
    const { setPoint } = this.algOptForm.value;
    if (setPoint === 'start') {
      this.grid.setStart([x, y]);
    } else {
      this.grid.setGoal([x, y]);
    }
  }
  private resetAnimation() {
    this.backtrace = [];
    this.backtraceAnimationIndex = -1;
    this.startAnimationIndex = -1;
    this.results = [];

  }
}
