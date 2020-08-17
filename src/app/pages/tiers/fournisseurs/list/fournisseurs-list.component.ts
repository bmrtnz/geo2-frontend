import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { NestedMain } from 'app/pages/nested/nested.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';

@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, NestedMain {

  fournisseurs: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  columnChooser = environment.columnChooser;
  detailedFields: ({ name: string } & ModelFieldOptions)[];

  constructor(
    public fournisseursService: FournisseursService,
    private router: Router,
  ) {
    this.apiService = this.fournisseursService;
  }

  ngOnInit() {
    this.fournisseurs = this.fournisseursService.getDataSource();
    this.detailedFields = this.fournisseursService.model.getDetailedFields();
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/fournisseurs/${event.data.id}`]);
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

  loadDataGridState() {
    const data = window.localStorage.getItem('fournisseurStorage');
    if (data !== null) {
      return JSON.parse(data);
    } else {
      return null;
    }
  }

  saveDataGridState(data) {
    window.localStorage.setItem('fournisseurStorage', JSON.stringify(data));
  }

}
