import { Component, Input, OnInit, ViewChild } from "@angular/core";
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

@Component({
  selector: "app-grid-lignes-totaux-detail",
  templateUrl: "./grid-lignes-totaux-detail.component.html",
  styleUrls: ["./grid-lignes-totaux-detail.component.scss"],
})
export class GridLignesTotauxDetailComponent implements OnInit {
  @Input() public ordre: Ordre;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;

  private gridConfig: Promise<GridConfig>;

  public columns: Observable<GridColumn[]>;
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public totalItems: TotalItem[] = [];

  constructor(
    private ordreLignesService: OrdreLignesService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreLignesTotauxDetail
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }
  ngOnInit(): void {
    this.enableFilters();
  }

  async enableFilters() {
    const sumFields = [
      "nombrePalettesExpediees",
      "nombreColisExpedies",
      "poidsBrutExpedie",
      "poidsNetExpedie",
      "logistique.nombrePalettesAuSol",
      "logistique.nombrePalettes100x120",
      "logistique.nombrePalettes80x120",
      "logistique.nombrePalettes60x80",
    ];

    const summaryInputs: SummaryInput[] = [];
    sumFields.map((field) =>
      summaryInputs.push({ selector: field, summaryType: SummaryType.SUM })
    );

    const columns = await this.columns.toPromise();
    const fields = columns.map((column) => column.dataField);

    this.totalItems = summaryInputs.map(
      ({ selector: column, summaryType }, index) => ({
        column,
        summaryType,
        displayFormat: !index
          ? this.localizeService.localize("totaux") + " : {0}"
          : "{0}",
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
        e.cellElement.textContent = e.data?.items[0]?.nombrePalettesExpediees;
      } else {
        if (e.columnIndex === 0) e.cellElement.textContent = e.data.key;
      }
    }
  }

  refresh() {
    this.dataGrid.instance.refresh();
  }

}
