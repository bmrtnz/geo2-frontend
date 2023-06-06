import { AfterViewInit, Component, Input, OnInit, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { SummaryInput, SummaryType } from "app/shared/services/api.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import {
  OrdreLignesService,
  SummaryOperation
} from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn, TotalItem } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-grid-marge",
  templateUrl: "./grid-marge.component.html",
  styleUrls: ["./grid-marge.component.scss"],
})
export class GridMargeComponent implements AfterViewInit, OnInit {
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
    private gridsService: GridsService,
    private functionsService: FunctionsService,
    public localizeService: LocalizationService,
    private currentCompanyService: CurrentCompanyService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreMarge
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }
  ngOnInit(): void {
    if (this?.ordre?.id) {
      this.functionsService
        .fCalculMargePrevi(
          this.ordre.id,
          this.currentCompanyService.getCompany().id
        )
        .subscribe({
          error: ({ message }: Error) => console.log(message),
          complete: () => this.enableFilters(),
        });
    }
  }

  ngAfterViewInit() {
    this.gridsService.register("OrdreMarge", this.dataGrid);
  }

  async enableFilters() {
    const summaryInputs: SummaryInput[] = [
      { selector: "totalAchat", summaryType: SummaryType.SUM },
      { selector: "totalCourtage", summaryType: SummaryType.SUM },
      { selector: "totalFraisAdditionnels", summaryType: SummaryType.SUM },
      { selector: "totalFraisMarketing", summaryType: SummaryType.SUM },
      { selector: "totalRemise", summaryType: SummaryType.SUM },
      { selector: "totalTransit", summaryType: SummaryType.SUM },
      { selector: "totalTransport", summaryType: SummaryType.SUM },
      { selector: "totalVenteBrut", summaryType: SummaryType.SUM },
      { selector: "totalObjectifMarge", summaryType: SummaryType.SUM },
      { selector: "totalRestitue", summaryType: SummaryType.SUM },
      { selector: "margeBrute", summaryType: SummaryType.SUM },
      { selector: "pourcentageMargeBrute", summaryType: SummaryType.SUM },
      { selector: "pourcentageMargeNette", summaryType: SummaryType.SUM },
    ];

    const columns = await this.columns.toPromise();
    const fields = columns.map((column) => column.dataField);

    this.dataSource = this.ordreLignesService.getSummarisedDatasource(
      SummaryOperation.Marge,
      fields,
      summaryInputs
    );

    this.totalItems = summaryInputs.map(
      ({ selector: column, summaryType }, index) => ({
        column,
        summaryType,
        displayFormat: !index
          ? this.localizeService.localize("totaux") + " : {0}"
          : "{0}",
        valueFormat: columns?.find(({ dataField }) => dataField === column)
          ?.format,
      })
    );

    if (this?.ordre?.id)
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Higlight important columns
      if (
        ["pourcentageMargeBrute", "pourcentageMargeNette"].includes(
          e.column.dataField
        )
      ) {
        // Bold text
        e.cellElement.classList.add("grey-light");
      }
    }
    if (e.rowType === "totalFooter") {
      if (
        ["pourcentageMargeBrute", "pourcentageMargeNette"].includes(
          e.column.dataField
        )
      ) {
        if (e.cellElement.innerText === "NaN") e.cellElement.innerText = "- %";
      }
    }
  }

  refresh() {
    this.dataGrid.instance.refresh();
  }

}
