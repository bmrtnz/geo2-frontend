import { AfterViewInit, Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
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
  public itemsWithSelectBox: string[];
  public allowMutations = false;
  public env = environment;
  public totalItems: { column: string, summaryType: SummaryType, displayFormat?: string }[] = [];
  @Input() public ordre: Ordre;
  @Output() public ligneDetail: any;
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
  }

  ngOnChanges() {
    this.allowMutations = !this.env.production && !Ordre.isCloture(this.ordre);
  }

  async enableFilters() {
    if (!this.datagrid) return;
    if (this?.ordre?.id) {
      const fields = this.columns.pipe(map(columns => columns.map(column => {
        return (this.addKeyToField(column.dataField));
      })));

      this.dataSource = this.ordreLignesService.getDataSource_v2(await fields.toPromise());
      this.dataSource.filter([
        ["ordre.id", "=", this.ordre.id],
      ]);
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

  onValueChanged(event, cell) {
    if (cell.setValue) {
      cell.setValue(event.value);
    }
  }

  onEditorPreparing(e) {
    if (e.parentType === "dataRow") {
      e.editorOptions.onFocusIn = (elem) => {
        if (e.dataField !== "fournisseur.code")
          this.formUtilsService.selectTextOnFocusIn(elem);
      };
    }
  }

  onEditingStart(e) {
    if (!e.column || !e.data.numero) return;
    this.ordreLignesService.lockFieldsDetails(e);
  }

  defineTemplate(field) {
    let templ;
    if (this.itemsWithSelectBox.includes(field)) templ = "selectBoxEditTemplate";
    // We use a invisible random field to show modify/auto buttons
    if (field === "article.matierePremiere.variete.id") templ = "modifAutoBtnTemplate";
    return templ ? templ : false;
  }

  async autoDetailExp({ key }: { key: string }) {
    await this.functionsService
      .fDetailsExpOnClickAuto(key)
      .toPromise();
    this.datagrid.instance.refresh();
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

  refresh() {
    this.datagrid.instance.refresh();
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

}


