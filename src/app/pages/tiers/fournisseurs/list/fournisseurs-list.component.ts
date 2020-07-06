import { Component, OnInit } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit {

  fournisseurs: DataSource;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public fournisseursService: FournisseursService,
    private router: Router
  ) { }

  ngOnInit() {
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.detailedFields = this.fournisseursService.model.getDetailedFields();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/fournisseurs/${e.data.id}`]);
  }
  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
  onCreate() {
    this.router.navigate([`/tiers/fournisseurs/create`]);
  }

}
