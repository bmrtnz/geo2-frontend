import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Client } from '../../../../shared/models';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { DxDataGridComponent } from 'devextreme-angular';
import ArrayStore from 'devextreme/data/array_store';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit, OnDestroy {

  @ViewChild(DxDataGridComponent, {static: false}) dataGrid: DxDataGridComponent;
  clients: DataSource;
  public clientsSubscription: Subscription;
  // test: Observable<DataSource>;

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) {
    this.clients = new DataSource({
      store: new ArrayStore({
        key: this.clientsService.keyField,
      }),
    });
  }

  ngOnInit() {
    // this.test = this.clientsService.getDataSource();
    this.clientsSubscription = this.clientsService.getAll()
    .pipe(
      map( res => this.clientsService.asList( res.data.allClient )),
    )
    .subscribe( res => {
      res.forEach((client: Client) => (this.clients.store() as ArrayStore).insert(client));
      this.clients.reload();
    });
  }

  ngOnDestroy() {
    this.clientsSubscription.unsubscribe();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/clients/${e.data.id}`]);
  }

}
