import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/grids-configs.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { mergeAll } from 'rxjs/operators';
import { AuthService, ClientsService } from '../../../../shared/services';

let self: ClientsListComponent;

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
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;

  constructor(
    public clientsService: ClientsService,
    public gridService: GridsConfigsService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.apiService = this.clientsService;
    self = this;
  }

  ngOnInit() {

    // Filtrage selon société sélectionnée
    this.clients = this.clientsService.getDataSource();
    this.clients.searchExpr('societe.id');
    this.clients.searchOperation('=');
    this.clients.searchValue(environment.societe.id);
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

  async loadDataGridState() {

    // Lecture
    const gridSource = self.gridService.getDataSource();
    gridSource.filter([
      ['utilisateur.nomUtilisateur', '=', self.authService.currentUser.nomUtilisateur],
      'and',
      ['grid', '=', 'clientStorage'],
    ]);
    return gridSource.load().then(res => {
      if (!res.length) return null;
      const data = res[0].config;
      if (data !== null) {
        // Suppression filtres/recherche
        for (const myColumn of data.columns) {
          if (myColumn.dataField !== 'valide') { myColumn.filterValue = null; }
        }
        data.searchText = '';
        data.focusedRowKey = null;
        return data;
      } else {
        return null;
      }
    });

  }

  saveDataGridState(data) {

    // Ecriture
    from(self.gridService.save({
      gridConfig: {
        utilisateur: { nomUtilisateur: self.authService.currentUser.nomUtilisateur },
        grid: 'clientStorage',
        config: data
      }
    }))
      .pipe(mergeAll())
      .subscribe();

  }

}
