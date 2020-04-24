import { Component, OnInit, OnDestroy } from '@angular/core';
import { TransporteursService } from '../../../../shared/services';
import { Transporteur } from '../../../../shared/models';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit, OnDestroy {

  transporteurs: DataSource;
  public transporteursSubscription: Subscription;

  constructor(
    private transporteursService: TransporteursService,
    private router: Router
  ) {
    this.transporteurs = new DataSource({
      store: new ArrayStore({
        key: this.transporteursService.keyField,
      }),
    });
  }

  ngOnInit() {
    this.transporteursSubscription = this.transporteursService.getAll()
    .pipe(
      map(res => this.transporteursService.asList( res.data.allTransporteur )),
    )
    .subscribe( res => {
      res.forEach((transporteur: Transporteur) => (this.transporteurs.store() as ArrayStore).insert(transporteur));
      this.transporteurs.reload();
    });
  }

  ngOnDestroy() {
    this.transporteursSubscription.unsubscribe();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/transporteurs/${e.data.id}`]);
  }

}
