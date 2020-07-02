import { Component, OnInit, ViewChild, EventEmitter, OnDestroy } from '@angular/core';
import { TransporteursService } from '../../../../shared/services';
import { Router, NavigationExtras, ActivatedRoute } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';
import { Transporteur } from 'app/shared/models';
import { Subscription } from 'rxjs';
import { NestedGrid } from 'app/pages/nested/nested.component';
import { map } from 'rxjs/operators';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit, OnDestroy, NestedGrid<Transporteur> {

  transporteurs: DataSource;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();
  rowDetailsRequested = new EventEmitter<Transporteur>();
  onRowDetailsSubscription: Subscription;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  detailsNavigationHook: (row) => [any[], NavigationExtras] = (event: Transporteur) => [
    [ event.id ],
    { relativeTo: this.activatedRoute.parent },
  ]

  constructor(
    public transporteursService: TransporteursService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
    this.onRowDetailsSubscription = this.rowDetailsRequested
    .pipe(map( this.detailsNavigationHook ))
    .subscribe( navigationParams => this.router.navigate(...navigationParams));
    this.detailedFields = this.transporteursService.model.getDetailedFields();
  }

  ngOnDestroy() {
    this.onRowDetailsSubscription.unsubscribe();
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
}
