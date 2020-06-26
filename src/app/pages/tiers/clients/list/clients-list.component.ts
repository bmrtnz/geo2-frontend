import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {

  clients: DataSource;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public clientsService: ClientsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
    this.detailedFields = this.clientsService.model.getDetailedFields();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/clients/${e.data.id}`]);
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
