import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { AuthService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/grids-configs.service';
import { LoadsavedatagridstateService } from 'app/shared/services/loadsavedatagridstate.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { mergeAll } from 'rxjs/operators';
import { FournisseursService } from '../../../../shared/services/fournisseurs.service';

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
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;

  constructor(
    public fournisseursService: FournisseursService,
    public gridService: GridsConfigsService,
    public loadsavedatagridstateService: LoadsavedatagridstateService,
    private router: Router,
    private authService: AuthService,
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
      ['utilisateur.nomUtilisateur', '=', self.authService.currentUser.nomUtilisateur],
      'and',
      ['grid', '=', 'fournisseurStorage'],
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
        grid: 'fournisseurStorage',
        config: data
      }
    }))
      .pipe(mergeAll())
      .subscribe();

  }

}
