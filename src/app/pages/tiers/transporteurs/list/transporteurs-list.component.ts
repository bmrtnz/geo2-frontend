import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { LocalizationService, TransporteursService } from 'app/shared/services';
import { GridColumn } from 'basic';
import { transporteur } from 'assets/configurations/grids.json';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GridConfiguratorService, Grid, GridConfig } from 'app/shared/services/grid-configurator.service';


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
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;

  constructor(
    public transporteursService: TransporteursService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    private router: Router,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = transporteursService;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Transporteur);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
  }

  async ngOnInit() {
    const fields = this.columns.pipe(map( columns => columns.map( column => column.dataField )));
    this.transporteurs = this.transporteursService.getDataSource_v2(await fields.toPromise());
  }

  onCreate() {
    this.router.navigate([`/tiers/transporteurs/create`]);
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/transporteurs/${event.data.id}`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

}
