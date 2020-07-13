import { Component, EventEmitter, OnInit, ViewChild, OnDestroy, Output } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';
import { NestedMain } from 'app/pages/nested/nested.component';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment} from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit, NestedMain {

  clients: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;

  constructor(
    public clientsService: ClientsService,
    private router: Router,
  ) {
    this.apiService = this.clientsService;
  }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
    this.detailedFields = this.clientsService.model.getDetailedFields();
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/clients/${event.data.id}`]);
  }

  onCreate() {
    this.router.navigate([`/tiers/clients/create`]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

}
