import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { ClientsService, LocalizationService } from 'app/shared/services';
import { client } from 'assets/configurations/grids.json';
import { GridColumn } from 'basic';

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
  detailedFields: GridColumn[];
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

  ngOnInit() {

    // Filtrage selon société sélectionnée
    this.detailedFields = client.columns;
    this.clients = this.clientsService.getDataSource(this.detailedFields.map(property => property.dataField));
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
