import {Component, OnInit, OnDestroy} from '@angular/core';
import {ClientsService} from '../../../../shared/services';
import {Client} from '../../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss']
})
export class ClientsListComponent implements OnInit, OnDestroy {

  dataSource: any;
  clients: [Client];
  private querySubscription: Subscription;

  constructor(
    private clientsService: ClientsService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.querySubscription = this.clientsService.getAll()
    .pipe(map(res => new ArrayStore({
      key: this.clientsService.keyField,
      data: res.data.allClient.edges.map( ({node}) => node ),
    })))
    .subscribe(store => this.dataSource = {store});
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/clients/${e.data.id}`]);
  }

}
