import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { LieuxPassageAQuaiService } from 'app/shared/services/api/lieux-passage-a-quai.service';
import { GridColumn } from 'basic';
import * as gridConfig from 'assets/configurations/grids.json';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Grid, GridConfig } from 'app/shared/services/grid-configurator.service';


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
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  columnChooser = environment.columnChooser;

  constructor(
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    public gridConfiguratorService: GridConfiguratorService,
    private router: Router,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.lieuxPassageAQuaiService;
  }

  async ngOnInit() {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.LieuPassageAQuai);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
    const fields = this.columns.pipe(map( columns => columns.map( column => column.dataField )));
    this.lieuxPassageAQuais = this.lieuxPassageAQuaiService.getDataSource_v2(await fields.toPromise());
    this.dataGrid.dataSource = this.lieuxPassageAQuais;
  }

  onRowDblClick(event) {
    this.router.navigate([`/tiers/lieux-passage-a-quai/${event.data.id}`]);
  }

  onCreate() {
    this.router.navigate([`/tiers/lieux-passage-a-quai/create`]);
  }

  onRowPrepared(e) {
    this.gridRowStyleService.applyGridRowStyle(e);
  }

}
