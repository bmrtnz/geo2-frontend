import {Component, OnInit} from '@angular/core';
import {ClientsService} from '../../../../shared/services/clients.service';
import {Client} from '../../../../shared/models/client';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {

  dataSource: any;
  clients: [Client];

  constructor(
    private clientsService: ClientsService
  ) {
  }

  ngOnInit(): void {
    this.clientsService.get().subscribe(c => {
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: [c]
        })
      };
    });
  }

}
