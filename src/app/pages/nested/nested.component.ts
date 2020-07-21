import { Component, OnInit, ViewChild, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GridNavigatorComponent } from 'app/shared/components/grid-navigator/grid-navigator.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { take, filter, map, switchMap } from 'rxjs/operators';
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
export class NestedComponent implements OnDestroy {

  @ViewChild(GridNavigatorComponent, { static: true }) gridNav: GridNavigatorComponent;
  @Output() dataGrid: DxDataGridComponent;
  scrollInSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
  ) {}

  onActivate(mainComponent: NestedMain & NestedPart) {

    this.dataGrid = mainComponent.dataGrid;

    const detailsOutlet = this.activatedRoute.children
    .find(({outlet}) => outlet === 'details' );
    this.scrollInSubscription = combineLatest(
      detailsOutlet ? detailsOutlet.params : of({}),
      mainComponent.contentReadyEvent.pipe(take(1)),
    )
    .pipe(
      map(([params]) => params.id),
      filter( key => key ),
      switchMap( key => mainComponent.apiService.locatePage({key}).pipe(map( res => ({...res, key}) ))),
    )
    .subscribe(async ({locatePage, key}) => {
      await this.dataGrid.instance.pageIndex(locatePage);
      this.dataGrid.focusedRowKey = key;
      this.gridNav.scrollToDetails();
    });

  }

  ngOnDestroy() {
    this.scrollInSubscription.unsubscribe();
  }

  onActivateDetails(partComponent: NestedPart) {

    partComponent.contentReadyEvent
    .pipe(take(1))
    .subscribe(() => this.gridNav.scrollToDetails({behavior: 'auto'}));

  }

}
