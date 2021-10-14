import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { LocalizationService, TransporteursService } from 'app/shared/services';
import { GridColumn } from 'basic';
import { transporteur } from 'assets/configurations/grids.json';


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
  detailedFields: GridColumn[];
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
  }

  ngOnInit() {
    this.detailedFields = transporteur.columns;
    this.transporteurs = this.transporteursService.getDataSource(this.detailedFields.map(property => property.dataField));
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
