import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClientsService, LocalizationService } from '../../../../shared/services';

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
  detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
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
    this.clients = this.clientsService.getDataSource();
    this.enableFilters();
    this.detailedFields = this.clientsService.model.getDetailedFields()
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field =>
          !!(this.localizeService.localize('tiers-clients-' + field.path.replace('.description', ''))).length);
       }),
    );

  }

  enableFilters() {
    this.clients.searchExpr('societe.id');
    this.clients.searchOperation('=');
    this.clients.searchValue(this.currentCompanyService.getCompany().id);
    this.clients.reload();
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
