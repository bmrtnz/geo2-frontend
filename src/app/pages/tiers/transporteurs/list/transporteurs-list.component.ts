import {Component, OnInit, OnDestroy} from '@angular/core';
import {TransporteursService} from '../../../../shared/services';
import {Client} from '../../../../shared/models';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit, OnDestroy {

  dataSource: any;
  clients: [Client];
  private querySubscription: Subscription;

  constructor(
    private transporteursService: TransporteursService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.querySubscription = this.transporteursService.getAll()
    .pipe(map(res => new ArrayStore({
      key: this.transporteursService.keyField,
      data: res.data.allTransporteur.edges.map( ({node}) => node ),
    })))
    .subscribe(store => this.dataSource = {store});
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/transporteurs/${e.data.id}`]);
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
