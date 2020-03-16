import {Component, OnInit} from '@angular/core';
import {FournisseursService} from '../../../../shared/services/fournisseurs.service';
import {Fournisseur} from '../../../../shared/models/fournisseur.model';
import ArrayStore from 'devextreme/data/array_store';
import {Router} from '@angular/router';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit {

  dataSource: any;
  fournisseurs: [Fournisseur];

  constructor(
    private fournisseursService: FournisseursService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.fournisseursService.get().then(c => {
      console.log(c)
      this.dataSource = {
        store: new ArrayStore({
          key: 'id',
          data: c
        })
      };
    });
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/fournisseurs/${e.data.id}`]);
  }

}
