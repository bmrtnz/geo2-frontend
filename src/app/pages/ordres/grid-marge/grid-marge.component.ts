import { Component, Input, ViewChild } from '@angular/core';
import type { Model } from 'app/shared/models/model';
import { ModelFieldOptions } from 'app/shared/models/model';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { SummaryType } from 'app/shared/services/api.service';
import { OrdreLignesService } from 'app/shared/services/api/ordres-lignes.service';
import { GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { ToggledGrid } from '../form/form.component';

@Component({
  selector: 'app-grid-marge',
  templateUrl: './grid-marge.component.html',
  styleUrls: ['./grid-marge.component.scss']
})
export class GridMargeComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  public dataGrid: DxDataGridComponent;
  public totalItems: {
    column: string,
    summaryType: SummaryType|string,
    valueFormat: any
  }[] = [];

  /* tslint:disable-next-line max-line-length */
  gridFilter: RegExp = /^(?:id|numero|referenceProdet|nombreColisExpedies|fournisseur\.code|total.*|totalFraisPlateforme|margeBrute|pourcentageMargeBrute|pourcentageMargeNette|ordre\.(?:id|numero)|logistique\.expedieStation|article\.(?:id|matierePremiere\.(?:variete\.id|type\.description)|cahierDesCharge\.(?:categorie\.id)|emballage.\.(?:emballage\.id)|normalisation\.(?:calibreMarquage\.id)))$/;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: Observable<
    ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
  >;

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = this.ordreLignesService.model
    .getDetailedFields(3, this.gridFilter, {forceFilter: true});
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesService
      .getSummarisedDatasource(2, this.gridFilter);
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);
    }
  }

  async onToggling(toggled: boolean) {
    const fields = await this.ordreLignesService.model
    .getDetailedFields(1, /^(?:total.*|margeBrute)$/, {forceFilter: true})
    .toPromise();

    this.totalItems = fields
    .map(({path: column, format: valueFormat}) => ({
      column,
      summaryType: SummaryType.SUM,
      valueFormat,
    }));

    for (const column of ['pourcentageMargeBrute', 'pourcentageMargeNette'])
      this.totalItems.push({
        column,
        summaryType: `custom-${column}`,
        valueFormat: { type: 'percent', precision: 2 },
      });

    toggled ? this.enableFilters() : this.dataSource = null;

  }
}
