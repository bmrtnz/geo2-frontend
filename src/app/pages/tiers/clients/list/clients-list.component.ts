import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {

  clients: DataSource;

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) { }

  ngOnInit() {
    this.clients = this.clientsService.getDataSource();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/clients/${e.data.id}`]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight');
      }
    }
  }

}
