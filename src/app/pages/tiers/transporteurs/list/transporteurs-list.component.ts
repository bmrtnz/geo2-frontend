import { Component, OnInit } from '@angular/core';
import { TransporteursService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { ModelFieldOptions } from 'app/shared/models/model';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit {

  transporteurs: DataSource;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public transporteursService: TransporteursService,
    private router: Router
  ) { }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
    this.detailedFields = this.transporteursService.model.getDetailedFields();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/transporteurs/${e.data.id}`]);
  }
  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }
}
