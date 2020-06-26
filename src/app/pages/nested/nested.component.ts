import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras, Params } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { combineLatest } from 'rxjs';

export interface NestedGrid<Model = any> {
  dataGrid: DxDataGridComponent;
  detailsNavigationHook: (row: Model) => [any[], NavigationExtras];
  contentReadyEvent: EventEmitter<any>;
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

    // NOT WORKING =/
    // select row by route
    // combineLatest(
    //   this.activatedRoute.children.find( ({outlet}) => outlet === 'details' ).params,
    //   listComponent.contentReadyEvent,
    // ).subscribe(([params]) => {
    //   // this.dataGrid.focusedRowIndex = this.dataGrid.instance.getRowIndexByKey(params.id);
    //   this.dataGrid.instance.navigateToRow(params.id);
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
