import { Component, Input, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { GridColumn } from "basic";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridConfiguratorService, Grid, GridConfig } from "app/shared/services/grid-configurator.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { ArticlesService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import ArrayStore from "devextreme/data/array_store";

@Component({
  selector: 'app-grid-stat-article-fournisseurs',
  templateUrl: './grid-stat-article-fournisseurs.component.html',
  styleUrls: ['./grid-stat-article-fournisseurs.component.scss']
})
export class GridStatArticleFournisseursComponent {

  @Input() public articleId: string;
  @Input() public dateMin: Date;
  @Input() public dateMax: Date;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public historiqueModificationsDetailService: HistoriqueModificationsDetailService,
    public gridConfiguratorService: GridConfiguratorService,
    private articlesService: ArticlesService,
    private currentCompanyService: CurrentCompanyService,
    public dateManagementService: DateManagementService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.StatsArticleFournisseur
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async enableFilters() {

    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.datagrid.dataSource = null;
    this.datagrid.instance.beginCustomLoading("");
    this.articlesService.allArticleStatistiqueFournisseurs(
      new Set(await fields.toPromise()),
      this.dateMin,
      this.dateMax,
      this.articleId,
      this.currentCompanyService.getCompany().id
    )
      .subscribe((res) => {
        this.datagrid.instance.endCustomLoading();
        this.datagrid.instance.option("focusedRowIndex", 0);
        this.dataSource = new DataSource({
          store: new ArrayStore({ data: res })
        });
        this.datagrid.dataSource = this.dataSource;
      });
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
    }
  }

  public clearDataSource() {
    this.datagrid.dataSource = null;
  }

  public refresh() {
    this.datagrid.instance.refresh();
  }
}
