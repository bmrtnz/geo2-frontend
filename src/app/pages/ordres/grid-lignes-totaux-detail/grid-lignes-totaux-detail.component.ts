import { AfterViewInit, Component, Input, OnInit, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { SummaryInput, SummaryType } from "app/shared/services/api.service";
import {
  OrdreLignesService,
  SummaryOperation
} from "app/shared/services/api/ordres-lignes.service";
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

let self;

@Component({
  selector: "app-grid-lignes-totaux-detail",
  templateUrl: "./grid-lignes-totaux-detail.component.html",
  styleUrls: ["./grid-lignes-totaux-detail.component.scss"],
})
export class GridLignesTotauxDetailComponent
  implements OnInit, AfterViewInit {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  private gridConfig: Promise<GridConfig>;

  public columns: Observable<GridColumn[]>;
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public totalItems: TotalItem[] = [];
  public summaryFields: any[];

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    private gridsService: GridsService,
    public localizeService: LocalizationService
  ) {
    self = this;
    this.summaryFields = [
      { column: "nombrePalettesExpediees", type: "sum", total: 0 },
      { column: "nombreColisExpedies", type: "sum", total: 0 },
      { column: "poidsBrutExpedie", type: "sum", total: 0 },
      { column: "poidsNetExpedie", type: "sum", total: 0 },
      { column: "logistique.nombrePalettesAuSol", type: "avg", total: 0 },
      { column: "logistique.nombrePalettes100x120", type: "avg", total: 0 },
      { column: "logistique.nombrePalettes80x120", type: "avg", total: 0 },
      { column: "logistique.nombrePalettes60x80", type: "avg", total: 0 }
    ];
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreLignesTotauxDetail
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngOnInit() {
    this.enableFilters();
  }

  ngAfterViewInit() {
    this.gridsService.register("TotauxDetail", this.dataGrid, this.gridsService.orderIdentifier(this.ordre));
  }

  async enableFilters() {
    const summaryInputs: SummaryInput[] = [];
    this.summaryFields.map((field) =>
      summaryInputs.push({ selector: field.column, summaryType: SummaryType.SUM })
    );

    const columns = await this.columns.toPromise();
    const fields = columns.map((column) => column.dataField);

    this.totalItems = summaryInputs.map(
      ({ selector: column, summaryType }, index) => ({
        column,
        summaryType,
        displayFormat: !index
          ? this.localizeService.localize("totaux") + " : "
          : " ",
        valueFormat: columns?.find(({ dataField }) => dataField === column)
          ?.format,
        showInGroupFooter: true,
      })
    );

    if (this?.ordre?.id) {
      this.dataSource = this.ordreLignesService.getSummarisedDatasource(
        SummaryOperation.TotauxDetail,
        fields,
        summaryInputs
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
    }
  }

  onCellPrepared(e) {
    if (e.rowType === "group") {
      if (
        e.column.dataField === "fournisseur.code" &&
        e.cellElement.textContent
      ) {
        e.cellElement.textContent = e.data?.aggregates[0];
      } else {
        if (e.columnIndex === 0) e.cellElement.textContent = e.data.key;
      }
    }
    // Reassigning real total values
    if (e.rowType === "totalFooter" && e.cellElement.textContent.includes(" ")) {
      const summaryField = this.summaryFields.find(field => field.column === e.column.dataField);
      e.cellElement.textContent += summaryField?.total;
    }

  }

  public calculateCustomSummary(options) {
    // Calculating real total values
    if (options.summaryProcess === "start") {
      options.totalValue = 0;
      options.count = 0;
    } else if (options.summaryProcess === "calculate") {
      options.totalValue += (options.value ?? 0);
      options.count++;
    } else if (options.summaryProcess === "finalize") {
      const field = self.summaryFields.find(field => field.column === options.name);
      if (field?.type === "avg" && options.count) options.totalValue /= options.count;
      field.total = (field.total ?? 0) + (options.totalValue ?? 0);
    }
  }

  refresh() {
    this.dataGrid.instance.refresh();
  }

}
