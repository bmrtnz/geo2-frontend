import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { from, Observable, PartialObserver } from "rxjs";
import { map } from "rxjs/operators";
import {
  GridConfiguratorService,
  Grid,
  GridConfig,
} from "app/shared/services/grid-configurator.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import notify from "devextreme/ui/notify";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import { ChoixRaisonDecloturePopupComponent } from "../choix-raison-decloture-popup/choix-raison-decloture-popup.component";
import { HistoriqueModifDetailPopupComponent } from "../historique-modif-detail-popup/historique-modif-detail-popup.component";
import { HistoriqueLogistiqueService } from "app/shared/services/api/historique-logistique.service";
import { AuthService } from "app/shared/services";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { GridLignesDetailsComponent } from "../grid-lignes-details/grid-lignes-details.component";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";

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
  public allowMutations = false;
  public env = environment;
  public currentLogId: string;
  public currentRowIndex: number;
  public countHisto: boolean;
  public changeCloture: boolean;
  public reasonId: string;
  @Input() public ordre: Ordre;
  @Output() public ordreLogistique: OrdreLogistique;
  @Input() public ligneLogistiqueId: string;
  @Output() refreshGridLigneDetail = new EventEmitter();
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ChoixRaisonDecloturePopupComponent, { static: false }) choixRaisonPopup: ChoixRaisonDecloturePopupComponent;
  @ViewChild(HistoriqueModifDetailPopupComponent, { static: false }) histoDetailPopup: HistoriqueModifDetailPopupComponent;

  constructor(
    public ordresLogistiquesService: OrdresLogistiquesService,
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
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreLigneLogistique,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    this.enableFilters();
    this.allowMutations = !this.env.production; // We can update some fields even if the order is closed
  }

  async enableFilters() {
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(
        map((columns) => columns.map((column) => column.dataField)),
      );
      this.dataSource = this.ordresLogistiquesService.getDataSource_v2(
        await fields.toPromise(),
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

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Best expression for date/time
      if (e.column.dataField === "dateDepartReelleFournisseur") {
        if (e.value)
          e.cellElement.innerText =
            this.dateManagementService.friendlyDate(e.value, true);
      }
      if (e.column.dataField === "expedieStation") {
        e.cellElement.classList.add("cursor-pointer");
      }

      if (e.column.dataField === "fournisseur.code") {
        e.cellElement.classList.add("text-underlined");
        e.cellElement.classList.add("cursor-pointer");
        e.cellElement.setAttribute(
          "title",
          this.localization.localize("hint-click-fournisseur"),
        );
      }

    }
  }

  public refresh() {
    this.datagrid.instance.refresh();
  }

  showHistoDetail(cell) {

    if (this.countHisto) return;
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
          notify("Aucun historique disponible", "warning", 3000);
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
    this.currentLogId = e.data.id;
    this.currentRowIndex = e.component.getRowIndexByKey(this.currentLogId);
    switch (e.column.dataField) {
      case "expedieStation": {
        if (this.changeCloture) return;
        if (e.data.expedieStation === true) {
          this.choixRaisonPopup.visible = true;
        } else {
          // Save cloture
          this.changeCloture = true;
          this.reasonId = "";
          this.saveGridField(this.currentRowIndex, "expedieStation", true);
        }
        break;
      }
      case "fournisseur.code": {
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
    this.changeCloture = false;
  }

  public handleCellChangeEventResponse<T>(): PartialObserver<T> {
    return {
      next: v => {
        this.refresh();
        this.refreshGridLigneDetail.emit(true);
      },
      error: (message: string) => {
        notify({ message }, "error", 7000);
        console.log(message);
      }
    };
  }

  onCheckCloturer(reasonId?) {

    this.functionsService.fDetailsExpOnCheckCloturer(
      reasonId,
      this.currentLogId,
      this.currentCompanyService.getCompany().id,
      this.authService.currentUser.nomUtilisateur
    ).valueChanges.subscribe(this.handleCellChangeEventResponse());

  }

}
