import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntrepotsService } from '../../../../shared/services/api/entrepots.service';

@Component({
  selector: 'app-entrepots-list',
  templateUrl: './entrepots-list.component.html',
  styleUrls: ['./entrepots-list.component.scss']
})
export class EntrepotsListComponent implements OnInit, NestedMain, NestedPart {

  entrepots: DataSource;
  clientID: string;
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  columnChooser = environment.columnChooser;
  contentReadyEvent = new EventEmitter<any>();
  @ViewChild(DxDataGridComponent, {static:true})
  dataGrid: DxDataGridComponent;
  apiService: ApiService; 

  constructor(
    public entrepotsService: EntrepotsService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    private router: Router,
    private route: ActivatedRoute,
    public gridConfiguratorService: GridConfiguratorService,
  ) {
    this.apiService = this.entrepotsService;
  }

  ngOnInit() {
    this.clientID = this.route.snapshot.paramMap.get('client');
    this.entrepots = this.entrepotsService.getDataSource();
    this.enableFilters();
    this.detailedFields = this.entrepotsService.model.getDetailedFields()
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field =>
          !!(this.localizeService.localize('tiers-entrepots-' + field.path.replace('.description', ''))).length);
       }),
    );
  }

  enableFilters() {
    if (!this.clientID) return;
    this.entrepots.filter(['client.id', '=', this.clientID]);
    this.entrepots.reload();
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
        if (e.data.preSaisie) {
          e.rowElement.classList.add('tovalidate-datagrid-row');
        }
      }
    }
  }
  
}
