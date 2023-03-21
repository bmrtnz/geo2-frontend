import { Component, EventEmitter, Input, Output, QueryList, ViewChild, ViewChildren } from "@angular/core";
import LitigeLigneForfait from "app/shared/models/litige-ligne-forfait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService, TransporteursService } from "app/shared/services";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
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
  selector: "app-grid-forfait-litige",
  templateUrl: "./grid-forfait-litige.component.html",
  styleUrls: ["./grid-forfait-litige.component.scss"]
})
export class GridForfaitLitigeComponent {

  @Input() public ordre: Ordre;
  @Input() public infosLitige: any;
  @Input() public lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];
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
    private litigesLignesService: LitigesLignesService,
    private litigesService: LitigesService,
    public gridConfiguratorService: GridConfiguratorService,
    public transporteursService: TransporteursService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreForfaitLitige,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
  }

  async enableFilters() {
    if (this.infosLitige) {
      const [litigeID, lotNum] = this.lot;
      const fields = this.columns
        .pipe(
          GridConfiguratorService.filterNonVirtual(),
          map(columns => columns.map(column => {
            return column.dataField;
          })));
      this.dataSource = this.litigesLignesService.allLitigeLigneForfaitDatasource(
        this.infosLitige.litige.id,
        new Set(["numeroGroupementLitige", ...await fields.toPromise()]),
      );
      this.dataSource.filter([
        ["numeroGroupementLitige", lotNum ? "=" : "=isnull=", lotNum]
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid) this.datagrid.dataSource = null;

    // Get transporteur (A payer) list
    this.litigesService.getLitigesAPayer(
      this.infosLitige.litige.id,
      new Set(["id", "codeFournisseur", "raisonSociale", "numeroTri", "type"])
    ).subscribe({
      next: (res) => {
        this.codePlusItems = res.data.allLitigeAPayer;
      }
    });

  }

  onInitNewRow(e) {
    e.data.litige = { id: this.infosLitige.litige.id };
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
    }
  }

  onSaved() {
    const litige = { id: this.infosLitige.litige.id, fraisAnnexes: this.datagrid.instance.getTotalSummaryValue("montant") };
    // Saving total
    this.litigesService.save(new Set(["id"]), litige).subscribe({
      next: () => this.totalFraisSaved.emit(),
      error: (error: Error) => {
        console.log(error);
        notify(error.message, "error", 7000);
      },
    });
  }

  public calculateForfaitClient(rowData: Partial<LitigeLigneForfait>) {
    if (rowData.clientQuantite === 1 && rowData.clientUniteFactureCode === "UNITE")
      return rowData.clientPrixUnitaire;
    return 666;
  }

  public calculateForfaitResponsable(rowData: Partial<LitigeLigneForfait>) {
    if (rowData.responsableQuantite === 1 && rowData.responsableUniteFactureCode === "UNITE")
      return rowData.responsablePrixUnitaire;
    return 666;
  }

}
