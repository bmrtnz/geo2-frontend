import { Component, Input, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { OrdresFraisService } from 'app/shared/services/api/ordres-frais.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToggledGrid } from '../form/form.component';

@Component({
  selector: 'app-grid-frais',
  templateUrl: './grid-frais.component.html',
  styleUrls: ['./grid-frais.component.scss']
})
export class GridFraisComponent implements ToggledGrid {
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
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = this.ordresFraisService.model
    .getDetailedFields(3, this.gridFilter, {forceFilter: true})
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreFrais-' + field.path.replaceAll('.', '-'))).length);
      }),
    )
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource = this.ordresFraisService
      .getDataSource(2, this.gridFilter);
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}

