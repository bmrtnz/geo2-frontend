import { Component, EventEmitter, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { GridsConfigsService } from 'app/shared/services/grids-configs.service';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { EntrepotsService } from '../../../../shared/services/entrepots.service';

let self: EntrepotsListComponent;

@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit {

  entrepots: DataSource;
  clientID: string;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;
  contentReadyEvent = new EventEmitter<any>();

  constructor(
    public entrepotsService: EntrepotsService,
    public gridService: GridsConfigsService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    self = this;
  }

  ngOnInit(): void {
    this.clientID = this.route.snapshot.paramMap.get('client');
    this.entrepots = this.entrepotsService.getDataSource();
    this.entrepots.filter(['client.id', '=', this.clientID]);
    this.detailedFields = this.entrepotsService.model.getDetailedFields();
  }

  onRowDblClick(e) {
    this.router.navigate([`/tiers/entrepots/${e.data.id}`]);
  }
  onCreate() {
    this.router.navigate([`/tiers/entrepots/create/${this.clientID}`]);
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
      ['grid', '=', 'entrepotStorage'],
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
        grid: 'entrepotStorage',
        config: data
      }
    }))
      .subscribe();

  }

}
