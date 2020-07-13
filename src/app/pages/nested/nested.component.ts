import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { take, filter, map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, of, Subscription } from 'rxjs';
import { ApiService } from 'app/shared/services/api.service';

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
}

@Component({
  selector: 'app-nested',
  templateUrl: './nested.component.html',
  styleUrls: ['./nested.component.scss']
})
export class NestedComponent implements OnInit, OnDestroy {

  @ViewChild(GridNavigatorComponent, { static: true }) gridNav: GridNavigatorComponent;
  @Output() dataGrid: DxDataGridComponent;
  scrollInSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit() {}

  onActivate(mainComponent: NestedMain & NestedPart) {

    const detailsOutlet = this.activatedRoute.children
    .find(({outlet}) => outlet === 'details' );
    this.dataGrid = mainComponent.dataGrid;

    this.scrollInSubscription = combineLatest(
      this.activatedRoute.queryParams,
      detailsOutlet ? detailsOutlet.params : of({}),
      mainComponent.contentReadyEvent.pipe(take(1)),
    )
    .pipe(
      tap(([queryParams]) => !queryParams.nofocus && this.gridNav.scrollIn()),
      map(([, params]) => params.id),
      filter( key => key ),
      switchMap( key => mainComponent.apiService.locatePage({key}).pipe(map( res => ({...res, key}) ))),
    )
    .subscribe(async ({locatePage, key}) => {
      await this.dataGrid.instance.pageIndex(locatePage);
      this.dataGrid.focusedRowKey = key;
    });

  }

  ngOnDestroy() {
    this.scrollInSubscription.unsubscribe();
  }

  onActivateDetails(partComponent: NestedPart) {
    combineLatest(
      this.activatedRoute.queryParams,
      partComponent.contentReadyEvent,
    )
    .pipe(take(1))
    .subscribe(([queryParams]) => !queryParams.nofocus && this.gridNav.scrollIn({behavior: 'auto'}));
  }

}
