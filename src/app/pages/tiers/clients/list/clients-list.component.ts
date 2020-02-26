import {Component, OnInit} from '@angular/core';
import {ClientsService} from '../../../../shared/services';
import {Client} from '../../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit {

  dataSource: any;
  clients: [Client];

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.clientsService.get().then(c => {
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/clients/${e.data.id}`]);
  }

}
