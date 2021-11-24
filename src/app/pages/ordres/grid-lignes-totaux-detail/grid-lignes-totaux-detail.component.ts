import { Component, Input, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { SummaryType } from 'app/shared/services/api.service';
import { OrdreLignesTotauxDetailService } from 'app/shared/services/api/ordres-lignes-totaux-detail.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToggledGrid } from '../form/form.component';

@Component({
  selector: 'app-grid-lignes-totaux-detail',
  templateUrl: './grid-lignes-totaux-detail.component.html',
  styleUrls: ['./grid-lignes-totaux-detail.component.scss']
})
export class GridLignesTotauxDetailComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]>;
  public totalItems: {column: string, summaryType: SummaryType, displayFormat?: string}[] = [];

  constructor(
    private ordreLignesTotauxDetailService: OrdreLignesTotauxDetailService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = this.ordreLignesTotauxDetailService.model.getDetailedFields(1)
    .pipe(
      // Filtrage headers possibles columnchooser
      map(fields => {
        return fields.filter( field => 
          !!(this.localizeService.localize('ordreLignesTotauxDetail-' + field.path.replaceAll('.', '-'))).length);
      }),
    );
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesTotauxDetailService
      .getTotauxDetailDataSource(this.ordre.id);
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  async onToggling(toggled: boolean) {
    const fields = await this.detailedFields.toPromise();
    this.totalItems = fields
    .filter( f => f.type === 'Number')
    .map(({path: column}, index) => {
      const displaytext = !index ? 'Total :' : '';
      return {column, summaryType: SummaryType.SUM, displayFormat: displaytext + ' {0}'};
    });
    toggled ? this.enableFilters() : this.dataSource = null;
  }
}
