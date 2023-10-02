import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren
} from "@angular/core";
import OrdreFrais from "app/shared/models/ordre-frais.model";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  EntrepotsService,
  LieuxPassageAQuaiService,
  LocalizationService,
  TransporteursService
} from "app/shared/services";
import { DevisesService } from "app/shared/services/api/devises.service";
import { OrdresFraisService } from "app/shared/services/api/ordres-frais.service";
import { TransitairesService } from "app/shared/services/api/transitaires.service";
import { TypesFraisService } from "app/shared/services/api/types-frais.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { EditorPreparingEvent } from "devextreme/ui/data_grid";
import { alert } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { CustomItemCreatingEvent } from "devextreme/ui/select_box";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-grid-frais",
  templateUrl: "./grid-frais.component.html",
  styleUrls: ["./grid-frais.component.scss"],
})
export class GridFraisComponent implements OnInit, AfterViewInit {
  @Input() public ordre: Ordre;

  public dataSource: DataSource;
  public fraisSource: DataSource;
  public deviseSource: DataSource;
  public transporteurSource: DataSource;
  public entrepotSource: DataSource;
  public transitaireSource: DataSource;
  public transitaireDouanierSource: DataSource;
  public lieuxPassageAQuaiSource: DataSource;
  public codePlusList: string[];
  public codePlusTransporteurs: string[];
  public codePlusTransitaires: string[];
  public codePlusEntrepots: string[];
  public itemsWithSelectBox: string[];
  public descriptionOnlyDisplaySB: string[];
  public SelectBoxPopupWidth: number;
  public showDecDedouan: boolean;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChildren(DxSelectBoxComponent)
  selectBoxes: QueryList<DxSelectBoxComponent>;

  constructor(
    private ordresFraisService: OrdresFraisService,
    public fraisService: TypesFraisService,
    public deviseService: DevisesService,
    public gridConfiguratorService: GridConfiguratorService,
    public codePlusService: TransporteursService,
    public gridsService: GridsService,
    public transporteursService: TransporteursService,
    public transitairesService: TransitairesService,
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    public entrepotsService: EntrepotsService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(Grid.OrdreFrais);
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.itemsWithSelectBox = ["frais", "devise", "codePlus"];
    this.descriptionOnlyDisplaySB = ["frais"];
    this.codePlusTransporteurs = [];
    this.codePlusTransitaires = [];
    this.codePlusEntrepots = [];
    this.fraisSource = this.fraisService.getDataSource_v2([
      "id",
      "description",
    ]);
    this.fraisSource.filter(["valide", "=", true]);
    this.deviseSource = this.deviseService.getDataSource_v2([
      "id",
      "description",
      "taux",
    ]);
    this.deviseSource.filter(["valide", "=", true]);
    this.initializeFournDataSources();
  }

  ngOnInit(): void {
    if (this?.ordre?.id) this.enableFilters();
    this.showDecDedouan = this.currentCompanyService.getCompany().id === "BUK";
  }

  decDedouan() {
    this.ordresFraisService.prcGenFraisDedimp(this.ordre.id).subscribe({
      next: () => {
        this.datagrid.instance.refresh();
      },
      error: (error: Error) => {
        alert(
          error.message,
          this.localizeService.localize("declaration-dedouan")
        );
      },
    });
  }

  initializeFournDataSources() {
    this.transporteurSource = this.transporteursService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.transporteurSource.filter(["valide", "=", true]);
    this.lieuxPassageAQuaiSource =
      this.lieuxPassageAQuaiService.getDataSource_v2(["id", "raisonSocial"]);
    this.lieuxPassageAQuaiSource.filter(["valide", "=", true]);
    this.transitaireSource = this.transitairesService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.transitaireSource.filter(["valide", "=", true]);
    this.transitaireDouanierSource = this.transitairesService.getDataSource_v2([
      "id",
      "raisonSocial",
    ]);
    this.transitaireDouanierSource.filter([
      ["valide", "=", true],
      "and",
      ["declarantDouanier", "=", true],
    ]);
    if (this?.ordre?.id) {
      this.entrepotSource = this.entrepotsService.getDataSource_v2([
        "id",
        "code",
        "raisonSocial",
      ]);
      const filtersEnt = [
        ["valide", "=", true],
        "and",
        ["client.valide", "=", true],
        "and",
        ["client.societe.id", "=", "BWS"],
        "and",
        ["client.code", "<>", "BWS GBP"],
        "and",
        ["client.code", "<>", "BWSMARKETING"],
        "and",
        ["code", "<>", "BWSMARKETING RMT"],
        "and",
        ["code", "<>", "Blue-Whale STOCK"],
        "and",
        ["code", "<>", "DIR GB  DURTAL"],
        "and",
        [
          [
            ["client.secteur.id", "=", "GB"],
            "and",
            ["client.secteur.id", "=", this.ordre.secteurCommercial.id],
          ],
          "or",
          [
            ["client.secteur.id", "<>", "GB"],
            "and",
            ["client.secteur.id", "=", "F"],
          ],
        ],
      ];
      this.entrepotSource.filter(filtersEnt);
    }
  }

  ngAfterViewInit() {
    this.gridsService.register("Frais", this.datagrid, this.gridsService.orderIdentifier(this.ordre));
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
      this.dataSource = this.ordresFraisService.getDataSource_v2(
        [
          ...await fields.toPromise(),
          "devise.description",
          "frais.description",
        ]
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.datagrid.dataSource = this.dataSource;
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  onInitNewRow(e) {
    e.data.valide = true;
    e.data.ordre = { id: this.ordre.id };
    e.data.devise = {
      id: this.currentCompanyService.getCompany().devise.id,
      description: this.currentCompanyService.getCompany().devise.description,
    };
    e.data.achatQuantite = 1; // Par défaut
    e.data.deviseTaux = 1; // Répercussion comp. Géo1. Ce taux ne change jamais
  }

  onEditingStart(cell) {
    if (!cell.column || !cell.data.deviseTaux) return;
    if (cell.column.dataField === "codePlus" && !cell.data.frais?.id)
      cell.cancel = true;
  }

  fetchCodePlusDataSource(frais: OrdreFrais["id"]) {
    if (!frais) return;
    this.initializeFournDataSources();
    if (frais === "RAMASS" || frais === "FRET")
      return this.transporteurSource;
    if (frais === "DEDIMP" || frais === "DEDEXP")
      return this.transitaireDouanierSource;
    if (frais === "TRANSI")
      return this.transitaireSource;
    if (frais === "QUAI")
      return this.lieuxPassageAQuaiSource;
    if (frais === "ENTBWS")
      return this.entrepotSource;
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      // Higlight important columns
      if (["montant", "montantTotal"].includes(e.column.dataField))
        e.cellElement.classList.add("grey-light");
    }
  }

  addKeyToField(field) {
    if (this.itemsWithSelectBox.includes(field) && field !== "codePlus") {
      field += `.${this[field + "Service"].model.getKeyField()}`;
    }
    return field;
  }

  public onEditorPreparing(e: EditorPreparingEvent) {
    if (e.parentType == "dataRow")
      this.configureSelectSources(e);

    // Optimizing lookup dropdown list width
    if (e.editorName === "dxSelectBox") {
      e.editorOptions.onOpened = (elem) =>
        elem.component._popup.option("width", 300);
    }
  }

  private configureSelectSources(e: EditorPreparingEvent) {
    if (e.dataField === "frais.id")
      e.editorOptions.dataSource = this.fraisSource;
    if (e.dataField === "devise.id")
      e.editorOptions.dataSource = this.deviseSource;
    if (e.dataField === "codePlus") {
      e.editorName = "dxSelectBox";
      e.editorOptions.acceptCustomValue = true;
      // Create on `Enter` https://js.devexpress.com/Documentation/ApiReference/UI_Components/dxSelectBox/Configuration/#customItemCreateEvent
      e.editorOptions.customItemCreateEvent = '';
      e.editorOptions.onCustomItemCreating = (event: CustomItemCreatingEvent) => {
        if (!event.customItem)
          event.customItem = { codePlus: event.text };
      }
      e.editorOptions.onValueChanged = args => {
        e.setValue({ codePlus: args.value });
      };
    }
  }

  setCellValue(newData: Partial<OrdreFrais>, value, currentData: Partial<OrdreFrais>) {
    const context: any = this;
    const achatPU = () => newData?.achatPrixUnitaire ?? currentData?.achatPrixUnitaire ?? 0;
    const achatDevisePU = () => newData?.achatDevisePrixUnitaire ?? currentData?.achatDevisePrixUnitaire ?? 0;
    const taux = () => newData?.deviseTaux ?? currentData?.deviseTaux ?? 0;
    const achatQuantite = () => newData?.achatQuantite ?? currentData?.achatQuantite ?? 0;

    if (context.dataField === "codePlus")
      value = value?.codePlus?.substring(0, 35);
    context.defaultSetCellValue(newData, value);
    if (context.dataField === "frais.id")
      newData.codePlus = '';

    newData.achatPrixUnitaire = achatDevisePU() * taux();
    newData.montant = achatQuantite() * achatDevisePU();
    newData.montantTotal = achatQuantite() * achatPU();
  }

  onGridOut() {
    if (this.datagrid.instance.hasEditData())
      this.datagrid.instance.saveEditData();
  }

  onFocusedCellChanging(e) {
    if (e.columns[e.newColumnIndex].dataField === "codePlus") {
      const fraisID = e.rows?.[e.newRowIndex]?.data?.frais?.id;
      if (!fraisID)
        notify("Veuillez préalablement saisir un type de frais", "warning", 3000);
      else
        e.columns[e.newColumnIndex].editorOptions.dataSource = this.fetchCodePlusDataSource(fraisID);
    }

    if (e.prevColumnIndex === e.columns.length - 1)
      if ([e.prevRowIndex, e.newRowIndex].includes(e.rows.length - 1))
        this.datagrid.instance.addRow();
  }
}
