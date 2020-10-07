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
import { LieuxPassageAQuaiService } from '../../../../shared/services/lieux-passage-a-quai.service';

let self: LieuxPassageAQuaiListComponent;

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
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;

  constructor(
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    public gridService: GridsConfigsService,
    private router: Router,
  ) {
    this.apiService = this.lieuxPassageAQuaiService;
    self = this;
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

  async loadDataGridState() {

    // Lecture
    const gridSource = self.gridService.getDataSource();
    gridSource.filter([
      ['utilisateur.nomUtilisateur', '=', '7'],
      'and',
      ['grid', '=', 'lieudepassageaquaiStorage'],
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
        grid: 'lieudepassageaquaiStorage',
        config: data
      }
    }))
      .subscribe();

  }

}
