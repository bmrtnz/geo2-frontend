import { Component, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NestedMain } from 'app/pages/nested/nested.component';
import { LocalizationService } from 'app/shared/services';
import { ApiService } from 'app/shared/services/api.service';
import { GridsConfigsService } from 'app/shared/services/api/grids-configs.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridRowStyleService } from 'app/shared/services/grid-row-style.service';
import { DxDataGridComponent } from 'devextreme-angular';
import { LieuxPassageAQuaiService } from 'app/shared/services/api/lieux-passage-a-quai.service';
import { GridColumn } from 'basic';
import { Observable, of } from 'rxjs';
import { Grid } from 'app/shared/services/grid-configurator.service';
import { LieuPassageAQuai } from 'app/shared/models';


@Component({
  selector: 'app-lieux-passage-a-quai-list',
  templateUrl: './lieux-passage-a-quai-list.component.html',
  styleUrls: ['./lieux-passage-a-quai-list.component.scss']
})
export class LieuxPassageAQuaiListComponent implements OnInit, NestedMain {

  readonly gridID = Grid.LieuPassageAQuai;
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
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    public gridService: GridsConfigsService,
    public localizeService: LocalizationService,
    private gridConfiguratorService: GridConfiguratorService,
    private router: Router,
    public gridRowStyleService: GridRowStyleService,
  ) {
    this.apiService = this.lieuxPassageAQuaiService;
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
      .lieuxPassageAQuaiService
      .getDataSource_v2([LieuPassageAQuai.getKeyField() as string, ...fields]);
    });
  }

  onColumnsChange({current}: {current: GridColumn[]}) {
    this.updateData(current);
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
