import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ClientsService } from '../../../../shared/services';
import { Router } from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { DxDataGridComponent } from 'devextreme-angular';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment, loada} from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';

@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit, NestedMain, NestedPart {

  clients: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  detailedFields: ({ name: string } & ModelFieldOptions)[];
  columnChooser = environment.columnChooser;

  constructor(
    public clientsService: ClientsService,
    private router: Router,
  ) {
    this.apiService = this.clientsService;
  }

  ngOnInit() {
    // Filtrage selon société sélectionnée
    const dsOptions = {
      search: 'societe.id==' + environment.societe.id
    };

    this.clients = this.clientsService.getDataSource(dsOptions);
    this.detailedFields = this.clientsService.model.getDetailedFields();

    // Configuration datagrid
    this.loadDataGridState();
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/clients/${event.data.id}`]);
  }

  onCreate() {
    this.router.navigate([`/tiers/clients/create`]);
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
    window.localStorage.setItem('clientStorage', JSON.stringify(data));
  }

}
