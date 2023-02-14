import { Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService, TransporteursService } from "app/shared/services";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { OrdresFraisLitigeService } from "app/shared/services/api/ordres-frais-litige.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-frais-annexes-litige",
  templateUrl: "./grid-frais-annexes-litige.component.html",
  styleUrls: ["./grid-frais-annexes-litige.component.scss"]
})
export class GridFraisAnnexesLitigeComponent {

  @Input() public ordre: Ordre;
  @Input() public idLitige: string;
  @Output() public totalFraisSaved = new EventEmitter();


  public dataSource: DataSource;
  public codePlusItems: any[];
  public descriptionOnlyDisplaySB: string[];
  public SelectBoxPopupWidth: number;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChildren(DxSelectBoxComponent) selectBoxes: QueryList<DxSelectBoxComponent>;

  constructor(
    private ordresFraisLitigeService: OrdresFraisLitigeService,
    private litigesService: LitigesService,
    public gridConfiguratorService: GridConfiguratorService,
    public transporteursService: TransporteursService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreFraisLitige,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
  }

  async enableFilters() {
    if (this.idLitige) {
      const fields = this.columns.pipe(map(columns => columns.map(column => {
        return column.dataField;
      })));
      this.dataSource = this.ordresFraisLitigeService.getDataSource_v2(
        await fields.toPromise(),
      );
      this.dataSource.filter(["litige.id", "=", this.idLitige]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid) this.datagrid.dataSource = null;

    // Get transporteur (A payer) list
    this.litigesService.getLitigesAPayer(
      this.idLitige,
      new Set(["id", "codeFournisseur", "raisonSociale", "numeroTri", "type"])
    ).subscribe({
      next: (res) => {
        this.codePlusItems = res.data.allLitigeAPayer;
      }
    });

  }

  onInitNewRow(e) {
    e.data.litige = { id: this.idLitige };
    e.data.frais = { id: "DIVERS" };
    setTimeout(() => this.datagrid.instance.saveEditData(), 1);
  }

  onValueChanged(event, cell) {
    if (!event.event) return;
    if (cell.setValue) cell.setValue(event.value.codeFournisseur);
  }

  displayIdBefore(data) {
    return data ? data.codeFournisseur + " - " + data.raisonSociale : null;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Higlight important columns
      if (e.column.dataField === "montant")
        e.cellElement.classList.add("grey-light-montant"); // Grey background
      // if (e.column.dataField === "transporteurCodePlus" && this.codePlusItems?.length) {
      //   e.cellElement.textContent = e.value + " - " + this.codePlusItems.filter(r => r.codeFournisseur === e.value)[0].raisonSociale;
      // }
    }

  }

  onSaved() {
    const litige = { id: this.idLitige, fraisAnnexes: this.datagrid.instance.getTotalSummaryValue("montant") };
    // Saving total
    this.litigesService.save(new Set(["id"]), litige).subscribe({
      next: () => this.totalFraisSaved.emit(),
      error: (error: Error) => {
        console.log(error);
        notify(error.message, "error", 7000);
      },
    });
  }

}
