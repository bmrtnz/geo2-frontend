import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { Model, ModelFieldOptions } from 'app/shared/models/model';
import { LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { map } from 'rxjs/operators';
import { FournisseursService } from 'app/shared/services/api/fournisseurs.service';
import {GridColumn} from 'basic';
import { from, Observable } from 'rxjs';
import { Grid, GridConfig } from 'app/shared/services/grid-configurator.service';


@Component({
  selector: 'app-fournisseurs-list',
  templateUrl: './fournisseurs-list.component.html',
  styleUrls: ['./fournisseurs-list.component.scss']
})
export class FournisseursListComponent implements OnInit, NestedMain {

  fournisseurs: DataSource;
  contentReadyEvent = new EventEmitter<any>();
  apiService: ApiService;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  constructor(
    public fournisseursService: FournisseursService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    private router: Router,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.fournisseursService;
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.Fournisseur);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    const fields = this.columns.pipe(map( columns => columns.map( column => column.dataField )));
    this.fournisseurs = this.fournisseursService.getDataSource_v2(await fields.toPromise());
    this.dataGrid.dataSource = this.fournisseurs;
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/fournisseurs/${event.data.id}`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

  onCreate() {
    this.router.navigate([`/tiers/fournisseurs/create`]);
  }

}
