import { Component, OnInit, OnDestroy } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { Fournisseur } from '../../../../shared/models/fournisseur.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, OnDestroy {

  fournisseurs: DataSource;
  public fournisseursSubscription: Subscription;

  constructor(
    private fournisseursService: FournisseursService,
    private router: Router
  ) {
    this.fournisseurs = new DataSource({
      store: new ArrayStore({
        key: this.fournisseursService.keyField,
      }),
    });
  }

  ngOnInit() {
    this.fournisseursSubscription = this.fournisseursService.getAll()
    .pipe(
      map(res => this.fournisseursService.asList( res.data.allFournisseur )),
    )
    .subscribe( res => {
      res.forEach((fournisseur: Fournisseur) => (this.fournisseurs.store() as ArrayStore).insert(fournisseur));
      this.fournisseurs.reload();
    });
  }

  ngOnDestroy() {
    this.fournisseursSubscription.unsubscribe();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/fournisseurs/${e.data.id}`]);
  }

}
