import {Component, OnInit, OnDestroy} from '@angular/core';
import {FournisseursService} from '../../../../shared/services/fournisseurs.service';
import {Fournisseur} from '../../../../shared/models/fournisseur.model';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, OnDestroy {

  dataSource: any;
  fournisseurs: [Fournisseur];
  private querySubscription: Subscription;

  constructor(
    private fournisseursService: FournisseursService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.querySubscription = this.fournisseursService.getAll()
    .pipe(map(res => new ArrayStore({
      key: this.fournisseursService.keyField,
      data: res.data.allFournisseur.edges.map( ({node}) => node ),
    })))
    .subscribe(store => this.dataSource = {store});
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/fournisseurs/${e.data.id}`]);
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }

}
