import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import Ordre from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { HistoriqueLogistiqueService } from "app/shared/services/api/historique-logistique.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, PartialObserver } from "rxjs";
import { map } from "rxjs/operators";
import { ChoixRaisonDecloturePopupComponent } from "../choix-raison-decloture-popup/choix-raison-decloture-popup.component";
import { GridsService } from "../grids.service";
import { HistoriqueModifDetailPopupComponent } from "../historique-modif-detail-popup/historique-modif-detail-popup.component";

@Component({
  selector: "app-grid-ordre-ligne-logistique",
  templateUrl: "./grid-ordre-ligne-logistique.component.html",
  styleUrls: ["./grid-ordre-ligne-logistique.component.scss"],
})
export class GridOrdreLigneLogistiqueComponent implements OnChanges {
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public currentLogId: string;
  public currentRowIndex: number;
  public countHisto: boolean;
  public changeCloture: boolean;
  public askForCloture: boolean;
  public reasonId: string;
  public gridRowsTotal: number;

  @Input() public ordre: Ordre;
  @Output() public ordreLogistique: OrdreLogistique;
  @Input() public ligneLogistiqueId: string;
  @Input() public ordreBAFOuFacture;
  @Input() public gridCommandes;
  @Output() refreshGridLigneDetail = new EventEmitter();

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ChoixRaisonDecloturePopupComponent, { static: false })
  choixRaisonPopup: ChoixRaisonDecloturePopupComponent;
  @ViewChild(HistoriqueModifDetailPopupComponent, { static: false })
  histoDetailPopup: HistoriqueModifDetailPopupComponent;

  constructor(
    public ordresLogistiquesService: OrdresLogistiquesService,
    public ordresService: OrdresService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    private functionsService: FunctionsService,
    public gridUtilsService: GridUtilsService,
    private localization: LocalizationService,
    public historiqueModificationsDetailService: HistoriqueModificationsDetailService,
    public authService: AuthService,
    public formUtilsService: FormUtilsService,
    private currentCompanyService: CurrentCompanyService,
    public historiqueLogistiqueService: HistoriqueLogistiqueService,
    public localizeService: LocalizationService,
    private gridsService: GridsService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreLigneLogistique
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngOnChanges(changes: SimpleChanges) {
    this.enableFilters();
    if (this.datagrid && this.ordre)
      this.gridsService.register("SyntheseExpeditions", this.datagrid, this.gridsService.orderIdentifier(this.ordre));
  }

  async enableFilters() {
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(
        map((columns) => columns.map((column) => column.dataField))
      );
      this.dataSource = this.ordresLogistiquesService.getDataSource_v2(
        await fields.toPromise()
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.datagrid.dataSource = this.dataSource;
      this.gridUtilsService.resetGridScrollBar(this.datagrid);
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  applySentGridRowStyle(e) {
    if (e.rowType === "data") {
      if (e.data.expedieStation) {
        e.rowElement.classList.add("sent-highlight-datagrid-row");
      }
    }
  }

  onContentReady(e) {
    this.gridRowsTotal = e.component.getVisibleRows()?.length;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Best expression for date/time
      if (e.column.dataField === "dateDepartReelleFournisseur") {
        if (e.value)
          e.cellElement.innerText = this.dateManagementService.friendlyDate(
            e.value,
            true
          );
      }
      if (e.column.dataField === "expedieStation") {
        e.cellElement.classList.add("cursor-pointer");
      }

      if (
        e.column.dataField === "fournisseur.code" &&
        e.component.getVisibleRows()?.length > 1
      ) {
        e.cellElement.classList.add("text-underlined");
        e.cellElement.classList.add("cursor-pointer");
        e.cellElement.setAttribute(
          "title",
          this.localization.localize("hint-click-fournisseur")
        );
      }
    }
  }

  public refresh() {
    this.datagrid.instance.refresh();
  }

  async showHistoDetail(cell) {
    if (this.countHisto) return;
    await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
    this.countHisto = true;
    cell.cellElement.classList.add("hide-button");
    this.ligneLogistiqueId = cell.data.id;
    this.historiqueModificationsDetailService
      .countModifDetailHistoryById(this.ligneLogistiqueId)
      .then((res) => {
        this.countHisto = false;
        cell.cellElement.classList.remove("hide-button");
        if (res.countHistoriqueModificationDetail) {
          this.histoDetailPopup.visible = true;
        } else {
          notify(this.localization.localize("aucun-historique-trouve"), "warning", 3000);
        }
      });
  }

  onEditorPreparing(e) {
    if (e.parentType === "dataRow") {
      e.editorOptions.onFocusIn = (elem) => {
        this.formUtilsService.selectTextOnFocusIn(elem);
      };
    }
  }

  saveGridField(rowIndex, field, state) {
    this.datagrid.instance.cellValue(rowIndex, field, state);
    this.datagrid.instance.saveEditData();
  }

  onCellClick(e) {
    if (!e.data) return;
    this.currentLogId = e.data.id;
    this.currentRowIndex = e.component.getRowIndexByKey(this.currentLogId);
    switch (e.column.dataField) {
      case "expedieStation": {
        if (this.changeCloture || this.ordreBAFOuFacture) return;
        if (e.data.expedieStation === true) {
          // Conditions pour déclôturer
          this.ordresLogistiquesService
            .count(`id==${e.data.id} and ordre.lignes.article.matierePremiere.variete.modificationDetail==true`)
            .subscribe((articleModifDetail) => {
              if (!this.authService.isAdmin &&
                this.authService.currentUser.geoClient !== "2" &&
                e.data.ordre.societe.id !== "IMP" &&
                e.data.ordre.societe.id !== "IUK" &&
                e.data.fournisseur.indicateurModificationDetail != true &&
                e.data.ordre.client.modificationDetail != true &&
                e.data.ordre.secteurCommercial.id !== "PAL" &&
                !["RPO", "RPR", "RPF", "REP"].includes(e.data.ordre.type.id) &&
                articleModifDetail.data.countOrdreLogistique === 0
              ) return notify(this.localizeService.localize("warn-not-allowed"), "warning", 3000);
              this.choixRaisonPopup.visible = true;
            });
        } else {
          // Save cloture
          this.changeCloture = true;
          this.askForCloture = true;
          this.reasonId = "";
          this.saveGridField(this.currentRowIndex, "expedieStation", true);
        }
        break;
      }
      case "fournisseur.code": {
        if (!e.cellElement.classList.contains("text-underlined")) return;
        const addFilter = ["fournisseur.code", "=", e.data.fournisseur.code];
        this.refreshGridLigneDetail.emit(addFilter);
        break;
      }
    }
  }

  reasonChosen(reasonId) {
    // Save uncloture
    this.reasonId = reasonId;
    this.changeCloture = true;
    this.saveGridField(this.currentRowIndex, "expedieStation", false);
  }

  onSaved() {
    if (!this.changeCloture) return;
    this.onCheckCloturer(this.reasonId);
  }

  public handleCellChangeEventResponse<T>(): PartialObserver<T> {
    return {
      next: (v) => {
        this.changeCloture = false;
        this.refresh();
        this.refreshGridLigneDetail.emit(true);
        // Comptabilisation des retraits
        this.ordresService.fChgtQteArtRet(this.ordre.id).subscribe({
          next: () => this.gridsService.reload(["Commande"], this.gridsService.orderIdentifier(this.ordre)),
          error: (error: Error) => {
            notify(
              error.message.replace(
                "Exception while fetching data (/fChgtQteArtRet) : ",
                ""
              ),
              "error",
              7000
            );
          },
        });
      },
      error: (error: Error) => {
        this.changeCloture = false;
        if (this.askForCloture)
          this.saveGridField(this.currentRowIndex, "expedieStation", false); // Back to non-clôturé
        this.askForCloture = false;
        notify(
          error.message.replace(
            "Exception while fetching data (/fDetailsExpOnCheckCloturer) : ",
            ""
          ),
          "error",
          7000
        );
        console.log(error);
      },
    };
  }

  onCheckCloturer(reasonId?) {
    this.functionsService
      .fDetailsExpOnCheckCloturer(
        reasonId,
        this.currentLogId,
        this.currentCompanyService.getCompany().id,
        this.authService.currentUser.nomUtilisateur
      )
      .valueChanges.subscribe(this.handleCellChangeEventResponse());
  }
}
