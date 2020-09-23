import { Component, OnInit, ViewChild, EventEmitter } from '@angular/core';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';
import { Router} from '@angular/router';
import DataSource from 'devextreme/data/data_source';
import { NestedMain } from 'app/pages/nested/nested.component';
import { DxDataGridComponent } from 'devextreme-angular';
import { ModelFieldOptions } from 'app/shared/models/model';
import { environment } from 'environments/environment';
import { ApiService } from 'app/shared/services/api.service';
import { LoadsavedatagridstateService } from 'app/shared/services/loadsavedatagridstate.service';
import { GridsConfigsService } from 'app/shared/services/grids-configs.service';

let self: FournisseursListComponent;

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
    public gridService: GridsConfigsService,
    public loadsavedatagridstateService: LoadsavedatagridstateService,
    private router: Router,
  ) {
    this.apiService = this.fournisseursService;
    self = this;
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

  async loadDataGridState() {

    // Lecture
    const gridSource = self.gridService.getDataSource();
    gridSource.filter([
      ['utilisateur.nomUtilisateur', '=', '7'],
      'and',
      ['grid', '=', 'fournisseurStorage'],
    ]);
    return gridSource.load().then( res => {
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
    self.gridService.save({gridConfig: {
      utilisateur: {nomUtilisateur: '7'},
      grid: 'fournisseurStorage',
      config: data
    }})
    .subscribe();

  }

}
