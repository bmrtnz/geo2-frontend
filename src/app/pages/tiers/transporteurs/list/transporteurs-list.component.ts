import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/grids-configs.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { TransporteursService } from '../../../../shared/services';

let self: TransporteursListComponent;

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
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;

  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    private router: Router,
  ) {
    this.apiService = transporteursService;
    self = this;
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

  async loadDataGridState() {

    // Lecture
    const gridSource = self.gridService.getDataSource();
    gridSource.filter([
      ['utilisateur.nomUtilisateur', '=', '7'],
      'and',
      ['grid', '=', 'transporteurStorage'],
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
        utilisateur: { nomUtilisateur: '7' },
        grid: 'transporteurStorage',
        config: data
      }
    }))
      .subscribe();

  }

}
