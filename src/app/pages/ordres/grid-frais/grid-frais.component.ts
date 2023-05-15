import {
  Component,
  Input,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import OrdreFrais from "app/shared/models/ordre-frais.model";
import Ordre from "app/shared/models/ordre.model";
import {
  AuthService,
  EntrepotsService,
  LieuxPassageAQuaiService,
  LocalizationService,
  TransporteursService,
} from "app/shared/services";
import { DevisesService } from "app/shared/services/api/devises.service";
import { OrdresFraisService } from "app/shared/services/api/ordres-frais.service";
import { TransitairesService } from "app/shared/services/api/transitaires.service";
import { TypesFraisService } from "app/shared/services/api/types-frais.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { Observable, from } from "rxjs";
import { map } from "rxjs/operators";
import { ToggledGrid } from "../form/form.component";

@Component({
  selector: "app-grid-frais",
  templateUrl: "./grid-frais.component.html",
  styleUrls: ["./grid-frais.component.scss"],
})
export class GridFraisComponent implements ToggledGrid {
  @Input() public ordre: Ordre;

  public dataSource: DataSource;
  public fraisSource: DataSource;
  public deviseSource: DataSource;
  public codePlusSource: DataSource;
  public transporteurSource: DataSource;
  public entrepotSource: DataSource;
  public transitaireSource: DataSource;
  public transitaireDouanierSource: DataSource;
  public lieuxPassageAQuaiSource: DataSource;
  public codePlusList: string[];
  public selectPhase: boolean;
  public codePlusTransporteurs: string[];
  public codePlusTransitaires: string[];
  public codePlusEntrepots: string[];
  public itemsWithSelectBox: string[];
  public descriptionOnlyDisplaySB: string[];
  public SelectBoxPopupWidth: number;
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
    public transporteursService: TransporteursService,
    public transitairesService: TransitairesService,
    public lieuxPassageAQuaiService: LieuxPassageAQuaiService,
    public entrepotsService: EntrepotsService,
    public currentCompanyService: CurrentCompanyService,
    public localizeService: LocalizationService,
    public authService: AuthService
  ) {
    this.displayDescOnly = this.displayDescOnly.bind(this);
    this.displayCustom = this.displayCustom.bind(this);
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.OrdreFrais
    );
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
    this.selectPhase = false;
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
        await fields.toPromise()
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
    setTimeout(() => this.datagrid.instance.saveEditData(), 1);
  }

  onValueChanged(event, cell) {
    if (!event.event) return;
    let valueToSave;

    if (cell.setValue) {
      if (
        typeof event.value === "object" &&
        cell.column.dataField === "codePlus"
      ) {
        valueToSave = event.value?.code ?? event.value?.id ?? event.value;
      } else {
        valueToSave = event.value;
      }
      if (cell.column.dataField === "codePlus" && valueToSave !== null)
        valueToSave = valueToSave.substring(0, 35);

      switch (cell.column.dataField) {
        case "frais": {
          if (cell.data.codePlus)
            cell.component.cellValue(
              cell.component.getRowIndexByKey(cell.row.key),
              "codePlus",
              null
            );
          break;
        }
      }
      cell.setValue(valueToSave);
    }
  }

  onEditingStart(cell) {
    if (!cell.column || !cell.data.deviseTaux) return;
    if (cell.column.dataField === "codePlus" && !cell.data.frais?.id)
      cell.cancel = true;
  }

  displayCodeBefore(data) {
    if (data && !data.id) return data;
    return data
      ? (data.code ? data.code : data.id) +
          " - " +
          (data.raisonSocial
            ? data.raisonSocial
            : data.ville
            ? data.ville
            : data.description)
      : null;
  }

  displayDescOnly(data) {
    return data ? this.capitalize(data.description) : null;
  }

  displayCustom(data) {
    if (this.selectPhase) {
      return this.displayCodeBefore(data);
    } else {
      return data;
    }
  }

  returnCodeId(data) {
    return data.code ? data.code : data.id;
  }

  capitalize(data) {
    return data
      ? data.charAt(0).toUpperCase() + data.slice(1).toLowerCase()
      : null;
  }

  updateCodePlusDataSource(data) {
    const frais = data.frais?.id;
    if (!frais) return;
    this.selectPhase = true;
    this.initializeFournDataSources();
    this.selectBoxes
      .filter((component) => component.instance.$element()[0].id === data.id)
      .map((component) => {
        if (frais === "RAMASS" || frais === "FRET")
          component.dataSource = this.transporteurSource;
        if (frais === "DEDIMP" || frais === "DEDEXP")
          component.dataSource = this.transitaireDouanierSource;
        if (frais === "TRANSI") component.dataSource = this.transitaireSource;
        if (frais === "QUAI")
          component.dataSource = this.lieuxPassageAQuaiSource;
        if (frais === "ENTBWS") component.dataSource = this.entrepotSource;
      });
  }

  onCellClick(e) {
    if (e.rowType !== "data") return;
    // Warning when no cost type
    if (!e.data?.frais?.id && e.column.dataField === "codePlus") {
      notify("Veuillez préalablement saisir un type de frais", "warning", 3000);
    }
    // No DS is displayed
    if (e.column.dataField === "codePlus") {
      if (this.isCustomText(e.data)) {
        this.SelectBoxPopupWidth = 0;
        e.cellElement.classList.add("no-arrow");
      } else {
        this.SelectBoxPopupWidth = 400;
        e.cellElement.classList.remove("no-arrow");
        this.updateCodePlusDataSource(e.data);
      }
    }
  }

  isCustomText(data) {
    return ["DIVERS", "ANIM"].includes(data.frais?.id);
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

  onSaving(event) {
    const rowData = this.datagrid.instance
      .getVisibleRows()
      .filter((r) => r.isEditing);
    if (event.changes.length)
      event.promise = this.processSaving(event.changes, rowData[0].data);
  }

  async processSaving(changes, entity) {
    for (const change of changes) {
      // We add calculated values to changes as they're only on client side
      const calculated = {
        achatPrixUnitaire: this.calculateAchatPU(entity),
        montant: this.calculateMontant(entity),
        montantTotal: this.calculateMontantTotal(entity),
      };
      change.data = { ...change.data, ...calculated };
    }
  }

  onSaved() {
    this.selectPhase = false;
    this.datagrid.instance.repaint();
  }

  onToggling(toggled: boolean) {
    toggled && this?.ordre?.id
      ? this.enableFilters()
      : (this.dataSource = null);
  }

  public calculateAchatPU(entity: Partial<OrdreFrais>) {
    const PU = (entity.achatDevisePrixUnitaire ?? 0) * (entity.deviseTaux ?? 0);
    entity.achatPrixUnitaire = PU;
    return PU;
  }

  public calculateMontant(entity: Partial<OrdreFrais>) {
    return (entity.achatQuantite ?? 0) * (entity.achatDevisePrixUnitaire ?? 0);
  }

  public calculateMontantTotal(entity: Partial<OrdreFrais>) {
    return (entity.achatQuantite ?? 0) * (entity.achatPrixUnitaire ?? 0);
  }
}
