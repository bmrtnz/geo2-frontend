import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { ClientsService, LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { GridColumn } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';


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
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;

  constructor(
    public clientsService: ClientsService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    private router: Router,
    public gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.clientsService;
  }

  async ngOnInit() {

    // Filtrage selon société sélectionnée
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Client);
    this.columns = from(this.gridConfig).pipe(GridConfiguratorService.getColumns());
    const visibleFields = from(this.gridConfig)
    .pipe(
      GridConfiguratorService.getColumns(),
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
    );
    this.clients = this.clientsService
    .getDataSource_v2(await visibleFields.toPromise());
    this.enableFilters();
    this.dataGrid.dataSource = this.clients;
  }

  enableFilters() {
    this.clients.searchExpr('societe.id');
    this.clients.searchOperation('=');
    this.clients.searchValue(this.currentCompanyService.getCompany().id);
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/clients/${event.data.id}`]);
  }

  onCreate() {
    this.router.navigate([`/tiers/clients/create`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

}
