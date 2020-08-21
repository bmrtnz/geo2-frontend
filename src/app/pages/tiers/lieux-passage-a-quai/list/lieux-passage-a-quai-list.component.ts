import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';
import { NestedMain } from 'app/pages/nested/nested.component';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';

@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit, NestedMain {

  lieuxPassageAQuais: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;

  constructor(
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    private router: Router,
  ) {
    this.apiService = this.lieuxPassageAQuaiService;
  }

  ngOnInit() {
    this.lieuxPassageAQuais = this.lieuxPassageAQuaiService.getDataSource();
    this.detailedFields = this.lieuxPassageAQuaiService.model.getDetailedFields();
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/lieux-passage-a-quai/${event.data.id}`]);
  }

  onCreate() {
    this.router.navigate([`/tiers/lieux-passage-a-quai/create`]);
  }

  onRowPrepared(e) {
    if (e.rowType === 'data') {
      if (!e.data.valide) {
        e.rowElement.classList.add('highlight-datagrid-row');
      }
    }
  }

  loadDataGridState() {
    
    const data = window.localStorage.getItem('lieupassageaquaiStorage');
    if (data !== null) {

      // Suppression filtres/recherche
      const state = JSON.parse(data);
      for (const myColumn of state.columns) {
        if (myColumn.dataField !== 'valide') {myColumn.filterValue = null;}
      }
      state.searchText = '';

      return state;
    } else {
      return null;
    }

  }

  saveDataGridState(data) {
    window.localStorage.setItem('lieupassageaquaiStorage', JSON.stringify(data));
  }

}
