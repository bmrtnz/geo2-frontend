import { Component, EventEmitter, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { Client } from '../../../../shared/models';
import { DxDataGridComponent } from 'devextreme-angular';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit, OnDestroy {

  clients: DataSource;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  onRowDetailsRequested = new EventEmitter<Client>();
  onRowDetailsSubscription: Subscription;
  detailsNavigationHook: (row) => [any[], NavigationExtras] = (event: Client) => [[ event.id ], { relativeTo: this.activatedRoute.parent }];

  constructor(
    public clientsService: ClientsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
    this.onRowDetailsSubscription = this.onRowDetailsRequested
    .pipe(map( this.detailsNavigationHook ))
    .subscribe( navigationParams => this.router.navigate(...navigationParams));
  }

  ngOnDestroy() {
    this.onRowDetailsSubscription.unsubscribe();
  }

  onRowDblClick(e) {
    this.onRowDetailsRequested.emit(e.data);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

}
