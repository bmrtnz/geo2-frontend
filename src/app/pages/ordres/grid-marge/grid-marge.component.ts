import { Component, Input, ViewChild } from '@angular/core';
import Ordre from 'app/shared/models/ordre.model';
import { LocalizationService } from 'app/shared/services';
import { SummaryInput, SummaryType } from 'app/shared/services/api.service';
import { OrdreLignesService, SummaryOperation } from 'app/shared/services/api/ordres-lignes.service';
import { Grid, GridConfig, GridConfiguratorService } from 'app/shared/services/grid-configurator.service';
import { GridColumn, TotalItem } from 'basic';
import { DxDataGridComponent } from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { environment } from 'environments/environment';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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
  public totalItems: TotalItem[] = [];

  private gridConfig: Promise<GridConfig>;

  public columns: Observable<GridColumn[]>;
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreMarge);
    this.columns = from(this.gridConfig).pipe(map( config => config.columns ));
  }

  async enableFilters() {

    const summaryInputs: SummaryInput[] = [
      { selector: 'totalAchat', summaryType: SummaryType.SUM },
      { selector: 'totalCourtage', summaryType: SummaryType.SUM },
      { selector: 'totalFraisAdditionnels', summaryType: SummaryType.SUM },
      { selector: 'totalFraisMarketing', summaryType: SummaryType.SUM },
      { selector: 'totalRemise', summaryType: SummaryType.SUM },
      { selector: 'totalTransit', summaryType: SummaryType.SUM },
      { selector: 'totalTransport', summaryType: SummaryType.SUM },
      { selector: 'totalVenteBrut', summaryType: SummaryType.SUM },
      { selector: 'totalObjectifMarge', summaryType: SummaryType.SUM },
      { selector: 'totalRestitue', summaryType: SummaryType.SUM },
      { selector: 'margeBrute', summaryType: SummaryType.SUM },
      { selector: 'pourcentageMargeBrute', summaryType: SummaryType.SUM },
      { selector: 'pourcentageMargeNette', summaryType: SummaryType.SUM },
    ];

    const columns = await this.columns.toPromise();
    const fields = columns.map( column => column.dataField );

    this.dataSource = this.ordreLignesService
    .getSummarisedDatasource(SummaryOperation.Marge, fields, summaryInputs);

    this.totalItems = summaryInputs
    .map(({selector: column, summaryType}) => ({
      column,
      summaryType,
      valueFormat: columns
      ?.find(({ dataField }) => dataField === column)
      ?.format,
    }));

    if (this?.ordre?.id)
      this.dataSource.filter([['ordre.id', '=', this.ordre.id]]);

  }

  onToggling(toggled: boolean) {

    toggled ? this.enableFilters() : this.dataSource = null;

  }
}
