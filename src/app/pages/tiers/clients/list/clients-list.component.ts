import { Component } from '@angular/core';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent {

  dataSource: any;

  constructor() {
    this.dataSource = {
      store: {
        type: 'array',
        key: 'id',
        data: [
          {id: 0, nom: 'Test'},
          {id: 1, nom: 'Test2'}
        ]
      }
    };
  }

}
