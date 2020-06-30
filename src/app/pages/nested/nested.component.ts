import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { combineLatest, of } from 'rxjs';
import { take, filter, catchError, tap, map } from 'rxjs/operators';

export interface NestedGrid<Model = any> {
  dataGrid: DxDataGridComponent;
  detailsNavigationHook: (row: Model) => [any[], NavigationExtras];
  contentReadyEvent: EventEmitter<any>;
  rowDetailsRequested: EventEmitter<any>;
}

@Component({
  selector: 'app-nested',
  templateUrl: './nested.component.html',
  styleUrls: ['./nested.component.scss']
})
export class NestedComponent implements OnInit {

  @ViewChild(GridNavigatorComponent, { static: false }) gridNav: GridNavigatorComponent;
  @Output() dataGrid: DxDataGridComponent;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
  }

  onActivate(listComponent: NestedGrid) {

    this.dataGrid = listComponent.dataGrid;

    // select row from route
    // NOT WORKING, IMPOSSIBLE WITH PAGING ?
    // const detailsOutlet = this.activatedRoute.children
    // .find( ({outlet}) => outlet === 'details' );
    // combineLatest(
    //   detailsOutlet ? detailsOutlet.params : of({}),
    //   listComponent.contentReadyEvent,
    // )
    // .pipe(
    //   map( ([params, event]) => params.id || (event as any).component.getKeyByRowIndex(0)),
    //   take(1),
    // )
    // .subscribe( key => {
    //   this.dataGrid.instance.navigateToRow(key);
    //   // this.dataGrid.focusedRowIndex = this.dataGrid.instance.getRowIndexByKey(key);
    // });

    // navigation
    listComponent.detailsNavigationHook = row => {
      this.gridNav.scrollIn();
      return [
        [{ outlets: { details: [row.id] }}],
        { relativeTo: this.activatedRoute },
      ];
    };

  }

}
