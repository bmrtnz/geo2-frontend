import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { DxDataGridComponent } from 'devextreme-angular';

export interface NestedGrid<Model = any> {
  dataGrid: DxDataGridComponent;
  detailsNavigationHook: (row: Model) => [any[], NavigationExtras];
  // contentReadyEvent: EventEmitter<any>;
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
  ) {}

  ngOnInit() {
  }

  onActivate(listComponent: NestedGrid) {

    this.dataGrid = listComponent.dataGrid;

    // select row from route
    // this.dataGrid.autoNavigateToFocusedRow = true;
    // const detailsOutlet = this.activatedRoute.children
    // .find( ({outlet}) => outlet === 'details' );
    // combineLatest(
    //   detailsOutlet ? detailsOutlet.params : of({}),
    //   listComponent.contentReadyEvent,
    // )
    // .pipe(
    //   map( ([params, event]) => params.id || (event as any).component.getKeyByRowIndex(0)),
    //   map( key => {
    //     // Fetch row position info like :
    //     // < { type: 'GeoClient', key: '000141', pageSize: 10 }
    //     // > { index: 6, page: 2 }
    //     return {index: 1, page: 2};
    //   }),
    //   take(1),
    // )
    // .subscribe( async ({page, index}) => {
    //   // Not working because keys not follow one another ?
    //   // this.dataGrid.instance.navigateToRow(key);
    //   await this.dataGrid.instance.pageIndex(page);
    //   this.dataGrid.focusedRowIndex = index;
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
