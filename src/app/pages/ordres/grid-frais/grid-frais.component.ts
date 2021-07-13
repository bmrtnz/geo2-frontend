import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { OrdresFraisService } from 'app/shared/services/api/ordres-frais.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grid-frais',
  templateUrl: './grid-frais.component.html',
  styleUrls: ['./grid-frais.component.scss']
})
export class GridFraisComponent implements OnChanges {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  private gridFilter: RegExp = /^(?:frais\.description|montant|devise\.id|deviseTaux|codePlus|description|montantTotal)$/;

  constructor(
    private ordresFraisService: OrdresFraisService,
    public gridConfiguratorService: GridConfiguratorService
  ) {
    this.dataSource = this.ordresFraisService
    .getDataSource(2, this.gridFilter);
    this.detailedFields = this.ordresFraisService.model
    .getDetailedFields(3, this.gridFilter, {forceFilter: true});
  }

  ngOnChanges() {
    this.enableFilters();
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
      this.dataSource.reload();
    }
  }
}

