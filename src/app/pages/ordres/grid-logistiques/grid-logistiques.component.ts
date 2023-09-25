import { AfterViewInit, Component, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { InfoPopupComponent } from "app/shared/components/info-popup/info-popup.component";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  LieuxPassageAQuaiService,
  LocalizationService,
  TransporteursService
} from "app/shared/services";
import { IncotermsService } from "app/shared/services/api/incoterms.service";
import { InstructionsService } from "app/shared/services/api/instructions.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AjoutEtapeLogistiquePopupComponent } from "../ajout-etape-logistique-popup/ajout-etape-logistique-popup.component";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { GridOrdreLigneLogistiqueComponent } from "../grid-ordre-ligne-logistique/grid-ordre-ligne-logistique.component";
import { GridsService } from "../grids.service";
import { ZoomLieupassageaquaiPopupComponent } from "../zoom-lieupassageaquai-popup/zoom-lieupassageaquai-popup.component";
import { ZoomTransporteurPopupComponent } from "../zoom-transporteur-popup/zoom-transporteur-popup.component";

@Component({
  selector: "app-grid-logistiques",
  templateUrl: "./grid-logistiques.component.html",
  styleUrls: ["./grid-logistiques.component.scss"],
})
export class GridLogistiquesComponent implements OnInit, OnChanges, AfterViewInit {
  public dataSource: DataSource;
  public transporteurGroupageSource: DataSource;
  public groupageSource: DataSource;
  public incotermFournisseurSource: DataSource;
  public instructionsList: string[];
  public SelectBoxPopupWidth: number;
  public itemsWithSelectBox: string[];
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public addStepText: string;
  public infoPopupText: string;
  @Input() public ordre: Ordre;
  @Input() public gridLignesLogistique: GridOrdreLigneLogistiqueComponent;
  @Input() public gridCommandes: GridCommandesComponent;
  @Output() public transporteurLigneId: string;
  @Output() public transporteurTitle: string;
  @Output() public lieupassageaquaiLigneId: string;
  @Output() public lieupassageaquaiTitle: string;
  @Output() public lieuxGroupage: string[];
  @Output() public ligneId: string;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ZoomTransporteurPopupComponent, { static: false })
  zoomTransporteurPopup: ZoomTransporteurPopupComponent;
  @ViewChild(ZoomLieupassageaquaiPopupComponent, { static: false })
  zoomLieupassageaquaiPopup: ZoomLieupassageaquaiPopupComponent;
  @ViewChild(AjoutEtapeLogistiquePopupComponent, { static: false })
  ajoutEtapePopup: AjoutEtapeLogistiquePopupComponent;
  @ViewChild(InfoPopupComponent, { static: false })
  infoPopup: InfoPopupComponent;

  constructor(
    private ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    public groupageService: LieuxPassageAQuaiService,
    public gridsService: GridsService,
    public instructionsService: InstructionsService,
    public incotermFournisseurService: IncotermsService,
    public transporteurGroupageService: TransporteursService,
    public authService: AuthService,
    public formUtilsService: FormUtilsService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreLogistique
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.addStep = this.addStep.bind(this);
    this.itemsWithSelectBox = [
      "transporteurGroupage",
      "groupage",
      "incotermFournisseur",
    ];
    this.lieuxGroupage = [];
    this.instructionsList = [];
    this.addStepText = this.localizeService.localize("hint-addStep");
    this.transporteurGroupageSource =
      this.transporteurGroupageService.getDataSource_v2(["id", "raisonSocial"]);
    this.transporteurGroupageSource.filter(["valide", "=", true]);
    this.groupageSource = this.groupageService.getDataSource_v2([
      "id",
      "ville",
    ]);
    this.groupageSource.filter(["valide", "=", true]);
    this.incotermFournisseurSource =
      this.incotermFournisseurService.getDataSource_v2(["id", "description"]);
    this.incotermFournisseurSource.filter(["valide", "=", true]);
    this.instructionsService
      .getDataSource_v2(["id", "description", "valide"])
      .load()
      .then((res) => {
        res
          .filter((inst) => inst.valide)
          .map((inst) => this.instructionsList.push(inst.description));
      });
  }

  ngOnInit(): void {
    this.enableFilters();
  }

  ngAfterViewInit() {
    this.gridsService.register("Logistique", this.datagrid, this.gridsService.orderIdentifier(this.ordre));
  }


  async enableFilters() {
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(
        map((columns) =>
          columns.map((column) => {
            return this.addKeyToField(column.dataField);
          })
        )
      );
      this.dataSource = this.ordresLogistiquesService.getDataSource_v2(
        await fields.toPromise()
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.datagrid.dataSource = this.dataSource;
      this.datagrid.instance.columnOption(
        "incotermFournisseur",
        "visible",
        this.authService.currentUser.indicateurVisualisationIncotermFournisseur
      );
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  ngOnChanges() {
    this.enableFilters();
  }

  addKeyToField(field) {
    if (this.itemsWithSelectBox.includes(field)) {
      field += `.${this[field + "Service"].model.getKeyField()}`;
    }
    return field;
  }

  onValueChanged(event, cell) {
    if (cell.setValue) cell.setValue(event.value);
  }

  setSBInputTitle(className) {
    document.querySelectorAll("." + className + " input").forEach((sb) => {
      const inp = sb as HTMLInputElement;
      sb.setAttribute("title", inp.value);
    });
  }

  onCellClick(e) {
    // Way to avoid Dx Selectbox list to appear when cell is readonly
    this.SelectBoxPopupWidth = e.cellElement.classList.contains(
      "dx-datagrid-readonly"
    )
      ? 0
      : 400;
  }

  defineEditTemplate(field) {
    let templ;
    if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxTemplate";
    if (
      field === "dateDepartPrevueFournisseur" ||
      field === "dateLivraisonLieuGroupage" ||
      field === "dateDepartPrevueGroupage"
    )
      templ = "datetimeBoxTemplate";
    if (field === "codeFournisseur") templ = "simpleElementEditTemplate";
    if (field === "instructions") templ = "customSelectBoxTemplate";
    return templ ? templ : false;
  }

  addStep(e) {
    e.event.preventDefault();
    // if (e.row.data.groupage?.id) { // This condition may be more logical (?)
    if (this.lieuxGroupage && this.lieuxGroupage.length) {
      this.ligneId = e.row.data.id;
      this.ajoutEtapePopup.visible = true;
    } else {
      notify(
        this.localizeService.localize("text-groupage-popup"),
        "warning",
        5000
      );
    }
  }

  displayIdBefore(data) {
    return data
      ? data.id +
      " - " +
      (data.raisonSocial
        ? data.raisonSocial
        : data.ville
          ? data.ville
          : data.description)
      : null;
  }

  openFilePopup(e) {
    if (e.column?.dataField === "transporteurGroupage") {
      this.transporteurLigneId = e.data[e.column.dataField].id;
      if (this.transporteurLigneId === null) return;
      this.transporteurTitle = this.itemsWithSelectBox[0];
      this.zoomTransporteurPopup.visible = true;
    }
    if (e.column?.dataField === "groupage") {
      this.lieupassageaquaiLigneId = e.data[e.column.dataField].id;
      if (this.lieupassageaquaiLigneId === null) return;
      this.lieupassageaquaiTitle = this.itemsWithSelectBox[1];
      this.zoomLieupassageaquaiPopup.visible = true;
    }
  }

  onContentReady(e) {
    this.lieuxGroupage = [];
    e.component
      .getVisibleRows()
      .filter((row) => row.data.groupage?.id !== null)
      .map((row) => {
        if (!this.lieuxGroupage?.includes(row.data.groupage?.id))
          this.lieuxGroupage.push(row.data.groupage?.id);
      });
  }

  showBLCheck(cell) {
    return !!cell.data.fournisseurReferenceDOC;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (this.itemsWithSelectBox.includes(e.column.dataField)) {
        if (e.value?.id) {
          e.cellElement.classList.add("cursor-pointer");
        }
      }

      // Disallow deleting grid commandes fournisseurs
      if (e.column.command === "edit") {
        const deleteLink = e.cellElement.querySelector(".dx-link-delete");
        deleteLink?.classList.add("visibility-hidden");
        if (this.gridCommandes.grid.dataSource) {
          if (
            !this.gridCommandes.embalExp.includes(e.row.data.codeFournisseur)
          ) {
            deleteLink?.classList.remove("visibility-hidden");
          }
        }
      }
    }
  }

  onEditorPreparing(e) {
    if (e.parentType === "dataRow") {
      e.editorOptions.onFocusIn = (elem) => {
        this.formUtilsService.selectTextOnFocusIn(elem);
      };
    }
  }

  public refresh() {
    this.datagrid.instance.refresh();
  }

  public onRowRemoved() {
    this.gridLignesLogistique.refresh();
  }

  public afterAjoutOrdlog() {
    this.refresh();
    this.gridLignesLogistique.refresh();
  }

  onGridOut() {
    if (this.datagrid.instance.hasEditData())
      this.datagrid.instance.saveEditData();
  }

  setCellValue(newData: Partial<OrdreLogistique>, value, currentData: Partial<OrdreLogistique>) {
    const context: any = this;
    context.defaultSetCellValue(newData, value);
    if (context.dataField === "groupage")
      newData.typeLieuGroupageArrivee = 'G';
  }
}
