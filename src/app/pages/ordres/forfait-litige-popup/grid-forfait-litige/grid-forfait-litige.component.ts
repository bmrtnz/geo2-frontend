import {
  Component,
  EventEmitter,
  Input,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import LitigeLigneForfait from "app/shared/models/litige-ligne-forfait.model";
import LitigeLigne from "app/shared/models/litige-ligne.model";
import Litige from "app/shared/models/litige.model";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { LitigesLignesService } from "app/shared/services/api/litiges-lignes.service";
import { LitigesService } from "app/shared/services/api/litiges.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { Change, GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

let self;
@Component({
  selector: "app-grid-forfait-litige",
  templateUrl: "./grid-forfait-litige.component.html",
  styleUrls: ["./grid-forfait-litige.component.scss"],
})
export class GridForfaitLitigeComponent {
  @Input() public ordre: Ordre;
  @Input() public infosLitige: any;
  @Input() public lot: [Litige["id"], LitigeLigne["numeroGroupementLitige"]];
  @Output() public done = new EventEmitter<Partial<LitigeLigne>[]>();

  public dataSource: DataSource;
  public codePlusItems: any[];
  public descriptionOnlyDisplaySB: string[];
  public SelectBoxPopupWidth: number;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChildren(DxSelectBoxComponent)
  selectBoxes: QueryList<DxSelectBoxComponent>;

  constructor(
    private litigesLignesService: LitigesLignesService,
    private litigesService: LitigesService,
    public gridConfiguratorService: GridConfiguratorService,
    public transporteursService: TransporteursService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService
  ) {
    self = this;
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreForfaitLitige
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  async enableFilters() {
    if (this.infosLitige) {
      const [litigeID, lotNum] = this.lot;
      const fields = this.columns.pipe(
        GridConfiguratorService.filterNonVirtual(),
        map((columns) =>
          columns.map((column) => {
            return column.dataField;
          })
        )
      );
      this.dataSource =
        this.litigesLignesService.allLitigeLigneForfaitDatasource(
          this.infosLitige.litige.id,
          new Set(["numeroGroupementLitige", ...(await fields.toPromise())])
        );
      this.dataSource.filter([
        ["numeroGroupementLitige", lotNum ? "=" : "=isnull=", lotNum],
      ]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid) this.datagrid.dataSource = null;

    // Get transporteur (A payer) list
    this.litigesService
      .getLitigesAPayer(
        this.infosLitige.litige.id,
        new Set(["id", "codeFournisseur", "raisonSociale", "numeroTri", "type"])
      )
      .subscribe({
        next: (res) => {
          this.codePlusItems = res.data.allLitigeAPayer;
        },
      });
  }

  public calculateForfaitClient(rowData: Partial<LitigeLigneForfait>) {
    if (rowData.forfaitClient) return rowData.forfaitClient;
    if (
      rowData.clientQuantite === 1 &&
      rowData.clientUniteFactureCode === "UNITE"
    )
      return rowData.clientPrixUnitaire;
    return rowData.forfaitClient;
  }

  public calculateForfaitResponsable(rowData: Partial<LitigeLigneForfait>) {
    if (rowData.forfaitResponsable) return rowData.forfaitResponsable;
    if (
      rowData.responsableQuantite === 1 &&
      rowData.responsableUniteFactureCode === "UNITE"
    )
      return rowData.responsablePrixUnitaire;
    return rowData.forfaitResponsable;
  }

  public calculateForfait(e) {
    // Make forfait <> null
    return 1;
  }

  public calculateTaux(e) {
    return e.taux ?? 1;
  }

  public calcTaux(newData, value, currentRowData) {
    newData.taux = value;
    if (currentRowData.forfaitResponsable)
      newData.responsablePrixUnitaire =
        currentRowData.forfaitResponsable * value;
  }

  public calcValue(newData, value, currentRowData) {
    if (currentRowData.forfaitClient) {
      newData.clientPrixUnitaire = currentRowData.forfaitClient;
      newData.clientQuantite = 1;
      newData.clientUniteFactureCode = "UNITE";
      // Focus on forfait responsable
      setTimeout(() => {
        self.datagrid.instance.editCell(
          self.datagrid.instance.getRowIndexByKey(currentRowData.id),
          "forfait"
        );
        setTimeout(() => {
          const myInput = document.querySelector(".dx-state-focused");
          myInput?.nextElementSibling.querySelector("input").focus();
        }, 1);
      }, 100);
    }

    if (currentRowData.forfaitResponsable) {
      newData.responsablePrixUnitaire =
        currentRowData.forfaitResponsable * (currentRowData.taux ?? 1);
      newData.devisePrixUnitaire = currentRowData.forfaitResponsable;
      newData.responsableQuantite = 1;
      newData.responsableUniteFactureCode = "UNITE";
    }

    newData.prixUnitaire = 666;
    newData.quantite = 69;
    newData.uniteFactureCode = "YOHO";
  }

  public onSaving(event: {
    changes: Array<Change<LitigeLigneForfait>>;
    cancel: boolean;
    promise: Promise<void>;
  }) {
    event.cancel = true;
    this.done.emit(
      event.changes.map((change) => ({
        id: change.key,
        ...(change.data.forfaitClient
          ? {
              clientPrixUnitaire: change.data.clientPrixUnitaire,
              clientQuantite: change.data.clientQuantite,
              clientUniteFactureCode: change.data.clientUniteFactureCode,
              clientIndicateurForfait: true,
            }
          : {}),
        ...(change.data.forfaitResponsable
          ? {
              responsablePrixUnitaire: change.data.responsablePrixUnitaire,
              devisePrixUnitaire: change.data.forfaitResponsable,
              responsableQuantite: change.data.responsableQuantite,
              responsableUniteFactureCode:
                change.data.responsableUniteFactureCode,
              responsableIndicateurForfait: true,
            }
          : {}),
        envoisIncident: false,
      }))
    );
  }
}
