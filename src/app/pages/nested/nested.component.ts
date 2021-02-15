import { Component, EventEmitter, OnDestroy, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { ApiService } from 'app/shared/services/api.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { combineLatest, of, Subject } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

/**
 * Nested view main component
 */
export interface NestedMain {
  dataGrid: DxDataGridComponent;
  apiService: ApiService;
}
/**
 * Nested view component
 */
export interface NestedPart {
  contentReadyEvent: EventEmitter<any>;
  refreshGrid?: EventEmitter<any>;
}

@Component({
  selector: 'app-nested',
  templateUrl: './nested.component.html',
  styleUrls: ['./nested.component.scss']
})
export class NestedComponent implements OnDestroy {

  @ViewChild(GridNavigatorComponent, { static: true }) gridNav: GridNavigatorComponent;
  @Output() dataGrid: DxDataGridComponent;
  destroy = new Subject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnDestroy() {
    this.destroy.next(true);
    this.destroy.unsubscribe();
  }

  onActivate(mainComponent: NestedMain & NestedPart) {

    this.dataGrid = mainComponent.dataGrid;

    const detailsOutlet = this.activatedRoute.children
    .find(({outlet}) => outlet === 'details' );
    combineLatest([
      detailsOutlet ? detailsOutlet.params : of({}),
      mainComponent.contentReadyEvent.pipe(take(1)),
    ])
    .pipe(
      tap( _ => this.gridNav.scrollToDetails()),
      map(([params]) => params.id),
      filter( key => key ),
    )
    .subscribe(key => this.dataGrid.focusedRowKey = key);

  }

  onActivateDetails(partComponent: NestedPart) {

    partComponent.contentReadyEvent
    .pipe(take(1))
    .subscribe(() => this.gridNav.scrollToDetails({behavior: 'auto'}));

    // Rafraichissement datagrid list
    if (partComponent.refreshGrid) {
      partComponent.refreshGrid
      .pipe(takeUntil(this.destroy))
      .subscribe(() => this.dataGrid.instance.refresh());
    }

  }

}
