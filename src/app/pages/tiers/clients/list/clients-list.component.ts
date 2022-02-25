import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain, NestedPart } from 'app/pages/nested/nested.component';
import { ClientsService, LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { CurrentCompanyService } from 'app/shared/services/current-company.service';
import { Grid, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { GridColumn } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import { Observable, of } from 'rxjs';
import { Client } from 'app/shared/models';


@Component({
  selector: 'app-clients-list',
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.scss'],
})
export class ClientsListComponent implements OnInit, NestedMain, NestedPart {

  readonly gridID = Grid.Client;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  public columns: Observable<GridColumn[]>;

  public gridConfigHandler = event => this.gridConfiguratorService
  .init(this.gridID, {
    ...event,
    onColumnsChange: this.onColumnsChange.bind(this),
  })

  constructor(
    public clientsService: ClientsService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    public currentCompanyService: CurrentCompanyService,
    private router: Router,
    private gridConfiguratorService: GridConfiguratorService,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.clientsService;
  }

  ngOnInit() {
    this.columns = this.gridConfiguratorService.fetchColumns(this.gridID);
  }

  private updateData(columns: GridColumn[]) {

    of(columns)
    .pipe(
      GridConfiguratorService.getVisible(),
      GridConfiguratorService.getFields(),
    )
    .subscribe(fields => {
      this.dataGrid.dataSource = this
      .clientsService
      .getDataSource_v2([Client.getKeyField() as string, ...fields]);
      this.dataGrid.dataSource.filter(['societe.id', '=', this.currentCompanyService.getCompany().id]);
    });
  }

  onColumnsChange({current}: {current: GridColumn[]}) {
    this.updateData(current);
  }

  onRowDblClick(event) {
    this.router.navigate([`/pages/tiers/clients/${event.data.id}`]);
  }

  onCreate() {
    this.router.navigate([`/pages/tiers/clients/create`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

}
