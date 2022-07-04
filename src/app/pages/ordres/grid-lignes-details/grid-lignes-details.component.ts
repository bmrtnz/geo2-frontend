import { AfterViewInit, Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, AuthService } from "app/shared/services";
import { SummaryType } from "app/shared/services/api.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { TypesPaletteService } from "app/shared/services/api/types-palette.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import { Grid, GridConfig, GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../grids.service";
import { ModifDetailLignesPopupComponent } from "../modif-detail-lignes-popup/modif-detail-lignes-popup.component";


@Component({
  selector: "app-grid-lignes-details",
  templateUrl: "./grid-lignes-details.component.html",
  styleUrls: ["./grid-lignes-details.component.scss"]
})
export class GridLignesDetailsComponent implements AfterViewInit, OnChanges {

  public dataSource: DataSource;
  public typePaletteSource: DataSource;
  public paletteInterSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public itemsWithSelectBox: any;
  public allowMutations = false;
  public env = environment;
  public totalItems: { column: string, summaryType: SummaryType, displayFormat?: string }[] = [];
  public gridFilter: any[];
  public gridExpFiltered: boolean;
  public dataField: string;
  public ligneOrdre: any;
  @Input() public ordre: Ordre;
  @Output() public ligneDetail: any;
  @Output() refreshGridsSynthese = new EventEmitter();
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild(ModifDetailLignesPopupComponent, { static: false }) modifDetailPopup: ModifDetailLignesPopupComponent;

  constructor(
    public ordreLignesService: OrdreLignesService,
    public articlesService: ArticlesService,
    public typePaletteService: TypesPaletteService,
    public paletteInterService: TypesPaletteService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public formUtilsService: FormUtilsService,
    public localizeService: LocalizationService,
    public gridUtilsService: GridUtilsService,
    private functionsService: FunctionsService,
    private gridsService: GridsService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreLigneDetails);
    this.columns = from(this.gridConfig).pipe(map(config => config.columns));
    this.itemsWithSelectBox = [
      "typePalette",
      "paletteInter"
    ];
  }

  ngAfterViewInit() {
    this.typePaletteSource = this.typePaletteService.getDataSource_v2(["id", "description"]);
    this.typePaletteSource.filter([
      ["valide", "=", true],
    ]);
    this.paletteInterSource = this.typePaletteSource;
    this.enableFilters();
    this.gridsService.register("DetailExpeditions", this.datagrid);
  }

  ngOnChanges() {
    this.allowMutations = !this.env.production && !Ordre.isCloture(this.ordre);
  }

  async enableFilters(e?) {

    if (!this.datagrid) return;
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(map(columns => columns.map(column => {
        return (this.addKeyToField(column.dataField));
      })));

      this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());
      this.gridFilter = [["ordre.id", "=", this.ordre.id]];

      // Filtering from synthese expedition grid
      if (e && Array.isArray(e)) this.gridFilter.push("and", e);
      if (typeof e === "object" && !Array.isArray(e)) this.gridExpFiltered = false; // In case of manual grid refresh

      this.dataSource.filter(this.gridFilter);
      this.datagrid.dataSource = this.dataSource;
      this.gridUtilsService.resetGridScrollBar(this.datagrid);
    } else if (this.datagrid)
      this.datagrid.dataSource = null;
  }

  displayCodeBefore(data) {
    return data ?
      ((data.code ? data.code : data.id) + " - " + (data.nomUtilisateur ? data.nomUtilisateur :
        (data.raisonSocial ? data.raisonSocial : data.description)))
      : null;
  }

  addKeyToField(field) {
    if (this.itemsWithSelectBox.includes(field)) {
      field += `.${this[field + "Service"].model.getKeyField()}`;
    }
    return field;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Descript. article
      if (e.column.dataField === "article.id") {
        const infoArt = this.articlesService.concatArtDescript(e.data.article);
        e.cellElement.innerText = infoArt.concatDesc;
        e.cellElement.title = infoArt.concatDesc.substring(2) + "\r\n";
        // Bio in green
        if (infoArt.bio) e.cellElement.classList.add("bio-article");
      }
      // Higlight important columns
      if ([
        "nombrePalettesExpediees",
        "nombreColisExpedies",
        "poidsNetExpedie",
        "poidsBrutExpedie",
        "venteQuantite",
        "achatQuantite",
        "referenceControleQualite"
      ].includes(e.column.dataField)) {
        // Bold text
        e.cellElement.classList.add("bold-grey-light");
      }
    }
  }

  onCellClick(e) {

    const data = e.data;
    if (!data) return;

    let warnQty: string;
    if (e.column?.dataField === "achatQuantite") {
      if (["KILO", "COLIS", "PAL"].includes(data.achatUnite?.id)) warnQty = "d'achat";
    }
    if (e.column?.dataField === "venteQuantite") {
      if (["KILO", "COLIS", "PAL"].includes(data.venteUnite?.id)) warnQty = "de vente";
    }
    if (warnQty) notify(`Vous n'avez pas le droit de modifier la quantité pour l'unité ${warnQty}`, "warning", 3000);

  }

  cellValueChange(data) {

    if (!data.changes?.length) return;
    if (data.changes.some(c => c.type !== "update")) return;
    if (!this.dataField) return;

    const dataField = this.dataField;
    const currLigneOrdre = this.ligneOrdre;
    const saveLigneOrdre = data.changes[0].data.data.saveOrdreLigne;
    const rowIndex = data.component.getRowIndexByKey(data.changes[0].key);

    console.log(dataField, "has been changed");

    this.dataField = null;

    /**
     * Transcription on_det_exp_change.pbl (except warnings, see onCellClick())
     */

    switch (dataField) {
      case "nombrePalettesExpediees": {
        if (saveLigneOrdre.nombrePalettesExpediees === currLigneOrdre.nombrePalettesExpediees) return;

        if (currLigneOrdre.achatUnite?.id === "PAL")
          data.component.cellValue(rowIndex, "achatQuantite", saveLigneOrdre.nombrePalettesExpediees);
        if (currLigneOrdre.venteUnite?.id === "PAL")
          data.component.cellValue(rowIndex, "venteQuantite", saveLigneOrdre.nombrePalettesExpediees);
        this.saveGridEditData();
        break;
      }
      case "nombreColisExpedies": {
        if (saveLigneOrdre.nombreColisExpedies === currLigneOrdre.nombreColisExpedies) return;

        const uc = currLigneOrdre.article.emballage.uniteParColis;
        if (currLigneOrdre.achatUnite?.id === "COLIS") {
          data.component.cellValue(rowIndex, "achatQuantite", saveLigneOrdre.nombreColisExpedies);
        } else if (["KILO", "TONNE", "PAL", "CAMION"].includes(currLigneOrdre.achatUnite?.id)) {
        } else {
          data.component.cellValue(rowIndex, "achatQuantite", Math.ceil(saveLigneOrdre.nombreColisExpedies * uc));
        }

        if (currLigneOrdre.venteUnite?.id === "COLIS") {
          data.component.cellValue(rowIndex, "venteQuantite", saveLigneOrdre.nombreColisExpedies);
        } else if (["KILO", "TONNE", "PAL", "CAMION"].includes(currLigneOrdre.venteUnite?.id)) {
        } else {
          if (uc !== 0) {
            data.component.cellValue(rowIndex, "venteQuantite", Math.ceil(saveLigneOrdre.nombreColisExpedies * uc));
          }
        }
        this.saveGridEditData();
        break;
      }
      case "poidsNetExpedie": {
        if (saveLigneOrdre.poidsNetExpedie === currLigneOrdre.poidsNetExpedie) return;

        if (currLigneOrdre.achatUnite?.id === "KILO") {
          data.component.cellValue(rowIndex, "achatQuantite", saveLigneOrdre.poidsNetExpedie);
        }
        if (currLigneOrdre.achatUnite?.id === "TONNE") {
          // Rounded to 3 dec
          data.component.cellValue(rowIndex, "achatQuantite", Math.ceil(saveLigneOrdre.poidsNetExpedie * 1000) / 1E6);
        }

        if (currLigneOrdre.venteUnite?.id === "KILO") {
          data.component.cellValue(rowIndex, "venteQuantite", saveLigneOrdre.poidsNetExpedie);
        }
        if (currLigneOrdre.venteUnite?.id === "TONNE") {
          // Rounded to 3 dec
          data.component.cellValue(rowIndex, "venteQuantite", Math.ceil(saveLigneOrdre.poidsNetExpedie * 1000) / 1E6);
        }
        this.saveGridEditData();
        break;
      }

    }
  }

  saveGridEditData() {
    setTimeout(() => this.datagrid.instance.saveEditData());
  }

  onValueChanged(event, cell) {
    if (cell.setValue) {
      cell.setValue(event.value);
    }
  }

  onEditorPreparing(e) {
    if (e.parentType === "dataRow") {
      e.editorOptions.onFocusIn = (elem) => {
        this.dataField = e.dataField;
        this.ligneOrdre = e.row?.data;
        if (e.dataField !== "fournisseur.code") this.formUtilsService.selectTextOnFocusIn(elem);
      };
    }
  }

  onEditingStart(e) {
    if (!e.column || !e.data.numero) return;
    this.ordreLignesService.lockFieldsDetails(e);
  }

  async autoDetailExp({ key }: { key: string }) {
    await this.functionsService
      .fDetailsExpOnClickAuto(key)
      .toPromise();
    this.refresh();
  }

  modifDetailExp(cell) {
    this.ligneDetail = cell.data;
    const statut = this.ordre.facture ? "facturé" : this.ordre.bonAFacturer ? "bon à facturer" : "";
    if (statut) {
      notify("Ordre " + statut + ", la modification est impossible...", "warning", 3000);
    } else {
      this.modifDetailPopup.visible = true;
    }
  }

  refresh(e?) {
    this.gridExpFiltered = Array.isArray(e);
    if (this.gridExpFiltered) this.enableFilters(e);

    this.datagrid.instance.refresh();
    this.refreshGridsSynthese.emit(true);
  }

  resetFilter(e) {
    e.event.stopImmediatePropagation(); // To avoid sortering
    this.enableFilters();
    this.gridExpFiltered = false;
  }

  showModifButton(cell) {
    const data = cell.data;
    const show = data.logistique.expedieStation && (
      data.ordre.client.modificationDetail ||
      data.fournisseur.indicateurModificationDetail ||
      (data.fournisseur.indicateurModificationDetail && data.article.emballage.emballage.groupe.id === "PALOX") ||
      data.ordre.secteurCommercial.id === "IND" ||
      data.ordre.secteurCommercial.id === "PAL" ||
      data.ordre.societe.id === "IMP" ||
      this.authService.currentUser.geoClient === "2" ||
      data.ordre.type.id === "REF" ||
      data.ordre.type.id === "RPO" ||
      data.ordre.type.id === "RPR" ||
      data.ordre.type.id === "RDF" ||
      data.article.matierePremiere.variete.modificationDetail ||
      data.ordre.societe.id === "IUK"
    );
    return show;
  }

  showAutoButton(cell) {

    let show;
    const data = cell.data;
    if (data.logistique.expedieStation) {
      show = false;
    } else {
      show = (
        data.ordre.client.modificationDetail ||
        data.fournisseur.indicateurModificationDetail ||
        data.ordre.secteurCommercial.id === "PAL" ||
        this.authService.currentUser.geoClient === "2" ||
        data.ordre.societe.id === "IMP" ||
        data.ordre.societe.id === "UDC" ||
        data.article.cahierDesCharge.espece.id.substring(0, 5) === "EMBAL" ||
        data.ordre.type.id === "REP" ||
        data.ordre.type.id === "REF" ||
        data.ordre.type.id === "RPO" ||
        data.ordre.type.id === "RPR" ||
        data.ordre.type.id === "RDF" ||
        data.article.matierePremiere.variete.modificationDetail ||
        data.ordre.societe.id === "IUK"
      );
    }
    return show;
  }

  changeDetail(cell) {
    const data = cell.data;

  }


}


