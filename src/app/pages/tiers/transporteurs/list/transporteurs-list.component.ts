import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { TransporteursService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';
import { NestedMain } from 'app/pages/nested/nested.component';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';

@Component({
  selector: 'app-transporteurs-list',
  templateUrl: './transporteurs-list.component.html',
  styleUrls: ['./transporteurs-list.component.scss']
})
export class TransporteursListComponent implements OnInit, NestedMain {

  transporteurs: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;

  constructor(
    public transporteursService: TransporteursService,
    private router: Router,
  ) {
    this.apiService = transporteursService;
  }

  ngOnInit() {
    this.transporteurs = this.transporteursService.getDataSource();
    this.detailedFields = this.transporteursService.model.getDetailedFields();
  }

  onCreate() {
    this.router.navigate([`/tiers/transporteurs/create`]);
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/transporteurs/${event.data.id}`]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

  loadDataGridState() {
    const data = window.localStorage.getItem('clientStorage');
    if (data !== null) {

      // Suppression filtres/recherche
      const state = JSON.parse(data);
      for (const myColumn of state.columns) {
        myColumn.filterValue = null;
      }
      state.searchText = '';

      return state;
    } else {
      return null;
    }

  }

  saveDataGridState(data) {
    window.localStorage.setItem('transporteurStorage', JSON.stringify(data));
  }

}
