import { Component, Input, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { CQLignesService } from 'app/shared/services/api/cq-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToggledGrid } from '../details/ordres-details.component';

@Component({
  selector: 'app-grid-controle-qualite',
  templateUrl: './grid-controle-qualite.component.html',
  styleUrls: ['./grid-controle-qualite.component.scss']
})
export class GridControleQualiteComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  constructor(
    private cqLignesService: CQLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = this.cqLignesService.model
    .getDetailedFields(1, /(?!.*\.id$)/i, {forceFilter: true})
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ControleQualite-' + field.path.replaceAll('.', '-'))).length);
      }),
    );
  }

  enableFilters() {
    if (this.ordre) {
      this.dataSource = this.cqLignesService.getDataSource();
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
    }
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
