import { Component, EventEmitter, OnInit, ViewChild, OnDestroy, Output } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { Client } from '../../../../shared/models';
import { DxDataGridComponent } from 'devextreme-angular';
import { map, tap } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { NestedGrid } from 'app/pages/nested/nested.component';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit, OnDestroy, NestedGrid<Client> {

  clients: DataSource;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  contentReadyEvent = new EventEmitter<any>();
  rowDetailsRequested = new EventEmitter<Client>();
  onRowDetailsSubscription: Subscription;
  detailsNavigationHook: (row) => [any[], NavigationExtras] = (event: Client) => [[ event.id ], { relativeTo: this.activatedRoute.parent }];

  constructor(
    public clientsService: ClientsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
    this.onRowDetailsSubscription = this.rowDetailsRequested
    .pipe(map( this.detailsNavigationHook ))
    .subscribe( navigationParams => this.router.navigate(...navigationParams));
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
