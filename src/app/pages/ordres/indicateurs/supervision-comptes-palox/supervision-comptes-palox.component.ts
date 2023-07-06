import {
  AfterViewInit,
  Component,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import { fixObservableSubclass } from "@apollo/client/utilities";
import { alert } from "devextreme/ui/dialog";
import { Role } from "app/shared/models";
import MouvementEntrepot from "app/shared/models/mouvement-entrepot.model";
import MouvementFournisseur from "app/shared/models/mouvement-fournisseur.model";
import Ordre from "app/shared/models/ordre.model";
import RecapitulatifEntrepot from "app/shared/models/recapitulatif-entrepot.model";
import RecapitulatifFournisseur from "app/shared/models/recapitulatif-fournisseur.model";
import {
  AuthService,
  EntrepotsService,
  FournisseursService,
  LocalizationService,
} from "app/shared/services";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { SupervisionPaloxsService } from "app/shared/services/api/supervision-paloxs.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxSwitchComponent } from "devextreme-angular";
import { AjustDecomptePaloxPopupComponent } from "../../ajust-decompte-palox-popup/ajust-decompte-palox-popup.component";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../root/root.component";
import notify from "devextreme/ui/notify";
import { FunctionResult } from "app/shared/services/api/functions.service";

enum GridModel {
  MouvementsClients,
  RecapitulatifClients,
  MouvementsFournisseurs,
  RecapitulatifFournisseurs,
}

enum InputField {
  entrepot = "entrepot",
  fournisseur = "fournisseur",
  commercial = "commercial",
  dateMaxMouvements = "dateMaxMouvements",
}

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-supervision-comptes-palox",
  templateUrl: "./supervision-comptes-palox.component.html",
  styleUrls: ["./supervision-comptes-palox.component.scss"],
})
export class SupervisionComptesPaloxComponent implements OnInit, AfterViewInit {
  readonly INDICATOR_NAME = "SupervisionComptesPalox";

  public validRequiredEntity: {};

  @ViewChildren(DxDataGridComponent)
  paloxGrids: QueryList<DxDataGridComponent>;

  @ViewChild("switchType", { static: false }) switchType: DxSwitchComponent;
  @ViewChild("switchEntity", { static: false }) switchEntity: DxSwitchComponent;
  @ViewChild(AjustDecomptePaloxPopupComponent, { static: false })
  ajustDecPopup: AjustDecomptePaloxPopupComponent;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>[];
  public ordresDataSource: DataSource;
  public commercial: DataSource;
  public entrepot: DataSource;
  public fournisseur: DataSource;
  public formGroup = new UntypedFormGroup({
    entrepot: new UntypedFormControl(),
    fournisseur: new UntypedFormControl(),
    commercial: new UntypedFormControl(),
    dateMaxMouvements: new UntypedFormControl(
      this.dateManagementService.startOfDay()
    ),
  } as Inputs<UntypedFormControl>);

  private datasources: DataSource[] = [];
  public toRefresh: boolean;
  public paloxPopupPurpose: string;
  public info: any;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    public ordresService: OrdresService,
    public localization: LocalizationService,
    public supervisionPaloxsService: SupervisionPaloxsService,
    public entrepotsService: EntrepotsService,
    public fournisseursService: FournisseursService,
    public personnesService: PersonnesService,
    public authService: AuthService,
    public localizeService: LocalizationService,
    public dateManagementService: DateManagementService,
    private tabContext: TabContext,
    public currentCompanyService: CurrentCompanyService
  ) {
    this.validRequiredEntity = {
      client: true,
      entrepot: true,
      fournisseur: true,
    };
    this.entrepot = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.entrepot.filter([
      [
        ["client.societe.id", "=", this.currentCompanyService.getCompany().id],
        "and",
        ["client.secteur.id", "=", "PAL"],
      ],
    ]);
    this.fournisseur = this.fournisseursService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.fournisseur.filter([
      ["consignePaloxUdc", "=", true],
      "or",
      ["consignePaloxSa", "=", true],
    ]);
    this.commercial = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commercial.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
  }

  async ngOnInit() {
    this.toRefresh = true;
    this.columns = [
      Grid.MouvClientsComptesPalox,
      Grid.RecapClientsComptesPalox,
      Grid.MouvFournisseursComptesPalox,
      Grid.RecapFournisseursComptesPalox,
    ]
      .map((c) => this.gridConfiguratorService.fetchDefaultConfig(c))
      .map((g) => from(g).pipe(map((config) => config.columns)));

    const fields = this.columns.map((c) =>
      c.pipe(map((columns) => columns.map((column) => column.dataField)))
    );

    this.datasources = await Promise.all(
      [
        MouvementEntrepot,
        RecapitulatifEntrepot,
        MouvementFournisseur,
        RecapitulatifFournisseur,
      ].map(async (m, i) =>
        this.supervisionPaloxsService.getListDataSource(
          await fields[i].toPromise(),
          m
        )
      )
    );

    this.formGroup.valueChanges.subscribe((_) => (this.toRefresh = true));
  }

  ngAfterViewInit() {
    this.switchChange();
  }

  enableFilters() {
    this.toRefresh = false;
    const values: Inputs = this.formGroup.value;
    this.supervisionPaloxsService.setPersisantVariables({
      codeSociete: this.currentCompanyService.getCompany().id,
      codeCommercial: values.commercial?.id,
      codeEntrepot: this.switchEntity.value ? null : values.entrepot?.id,
      codeFournisseur: this.switchEntity.value
        ? values.fournisseur?.code
        : null,
      dateMaxMouvements: this.dateManagementService.endOfDay(
        values.dateMaxMouvements
      ),
    });
    const index = this.getActiveGridIndex();
    this.paloxGrids.toArray()[index].dataSource = this.datasources[index];
    this.datasources[index].filter([
      // ["codeFournisseur", "=", "BURATTI"],
      ["solde", "<>", 0],
    ]);
    // this.datasources[index].filter([
    //   [
    //     ["entree", "=", 0],
    //     "and",
    //     ["sortie", "<>", 0]
    //   ],
    //   "or",
    //   [
    //     ["entree", "<>", 0],
    //     "and",
    //     ["sortie", "=", 0]
    //   ],
    //   "or",
    //   [
    //     ["entree", "<>", 0],
    //     "and",
    //     ["sortie", "<>", 0],
    //   ]
    // ]);
  }

  onRowDblClick({ data }: { data: Ordre }) {
    // can't access campagne from native query
    // this.tabContext.openOrdre(data.numero);
  }

  displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }

  switchChange() {
    this.toRefresh = true;
    this.paloxGrids.map((component) => {
      component.dataSource = null;
      component.visible = false;
      return component;
    });
    const index = this.getActiveGridIndex();
    this.paloxGrids.toArray()[index].visible = true;
  }

  private getActiveGridIndex() {
    const type = this.switchType.value ? "Recapitulatif" : "Mouvements";
    const entity = this.switchEntity.value ? "Fournisseurs" : "Clients";
    return GridModel[type + entity];
  }

  onCellPrepared(e) {
    if (e.rowType === "data") {
      if (e.column.dataField === "sommeQuantiteInventaire")
        e.cellElement.classList.add("bold-text");
    }

    // Highlight groups
    if (e.rowType === "group") {
      if (
        (this.switchEntity.value ? "codeFournisseur" : ["codeClient"]).includes(
          e.column.dataField
        )
      )
        e.cellElement.classList.add("group-palox-header");
      if (e.column.dataField === "codeEmballage")
        e.cellElement.classList.add("subgroup-palox-header");
      if (
        (!this.switchEntity.value
          ? "codeFournisseur"
          : ["codeClient", "codeEntrepot"]
        ).includes(e.column.dataField)
      )
        e.cellElement.classList.add("subgroup2-palox-header");
    }
  }

  async adjustPalox(data, purpose) {
    let idEntrepot = "";
    this.paloxPopupPurpose = purpose;
    data = data.items?.length ? data.items[0] : data.collapsedItems[0];
    const entDS = this.entrepotsService.getDataSource_v2(["id"]);
    entDS.filter(["code", "=", data.codeEntrepot]);
    await entDS.load().then((res) => (idEntrepot = res[0]?.id));
    if (idEntrepot === "" || !idEntrepot)
      return notify("Erreur ID entrepôt", "error", 3000);
    this.info = {
      entrepotId: idEntrepot,
      entrepotCode: data.codeEntrepot,
      stationCode: data.codeFournisseur,
      codeClient: data.codeClient,
      paloxCode: data.codeEmballage,
      raisonSocialeFournisseur: data.raisonSocialeFournisseur,
      codeEspece: data.codeEspece,
    };
    this.ajustDecPopup.show();
  }

  onValidatePaloxPopup(e) {
    if (this.paloxPopupPurpose === "adjust") {
      // Adjustment
      this.supervisionPaloxsService
        .fAjustPalox(
          this.info.codeClient,
          this.info?.codeEspece ?? "EMBALL",
          e.date,
          this.info.entrepotCode,
          this.info.paloxCode,
          e.commentaire,
          this.currentCompanyService.getCompany().id,
          this.info.stationCode,
          e.nbPalox
        )
        .subscribe({
          next: (result) => {
            const data = result.data.fAjustPalox;
            if (data.res === 2)
              return alert(
                data.msg,
                this.localization.localize("text-popup-ajust-palox")
              );
            this.enableFilters();
            notify(
              this.localization.localize("text-popup-ajust-palox-ok"),
              "success",
              3000
            );
          },
          error: (error: Error) =>
            alert(
              this.messageFormat(error.message),
              this.localization.localize("text-popup-ajust-palox")
            ),
        });
    } else {
      // Inventory
      this.supervisionPaloxsService
        .fDecomptePalox(
          this.info?.codeEspece ?? "EMBALL",
          e.date,
          this.info.entrepotId,
          this.info.paloxCode,
          this.currentCompanyService.getCompany().id,
          this.info.stationCode,
          e.nbPalox
        )
        .subscribe({
          next: () => {
            notify(
              this.localization.localize("text-popup-inventaire-palox-ok"),
              "success",
              3000
            );
            this.enableFilters();
          },
          error: (error: Error) => {
            alert(
              this.messageFormat(error.message),
              this.localization.localize("text-popup-inventaire-palox")
            );
          },
        });
    }
  }

  private messageFormat(mess) {
    const functionNames = ["fDecomptePalox", "fAjustPalox"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }

  getInventoryData(e) {
    if (
      (!this.switchEntity.value && !this.switchType.value) ||
      (this.switchType.value && this.switchEntity.value)
    ) {
      if (e.items?.length)
        return (
          e.items[0].codeFournisseur +
          " - " +
          e.items[0].raisonSocialeFournisseur
        );
      if (e.collapsedItems?.length)
        return (
          e.collapsedItems[0].codeFournisseur +
          " - " +
          e.collapsedItems[0].raisonSocialeFournisseur
        );
    } else {
      if (e.items?.length)
        return (
          e.items[0].codeEntrepot + " - " + e.items[0].raisonSocialeEntrepot
        );
      if (e.collapsedItems?.length)
        return (
          e.collapsedItems[0].codeEntrepot +
          " - " +
          e.collapsedItems[0].raisonSocialeEntrepot
        );
    }
    return "";
  }

  inventoryDate(e) {
    if (
      (!this.switchEntity.value && !this.switchType.value) ||
      (this.switchType.value && this.switchEntity.value)
    ) {
      if (e.items?.length)
        return (
          this.dateManagementService.formatDate(
            e.items[0].dateInventaire,
            "dd-MM-yyyy"
          ) +
          " (" +
          e.items[0].quantiteInventaire +
          ")"
        );
      if (e.collapsedItems?.length)
        return (
          this.dateManagementService.formatDate(
            e.collapsedItems[0].dateInventaire,
            "dd-MM-yyyy"
          ) +
          " (" +
          e.collapsedItems[0].quantiteInventaire +
          ")"
        );
    } else {
      if (e.items?.length)
        return (
          this.dateManagementService.formatDate(
            e.items[0].dateInventaire,
            "dd-MM-yyyy"
          ) +
          " (" +
          e.items[0].quantiteInventaire +
          ")"
        );
      if (e.collapsedItems?.length)
        return (
          this.dateManagementService.formatDate(
            e.items[0].dateInventaire,
            "dd-MM-yyyy"
          ) +
          " (" +
          e.items[0].quantiteInventaire +
          ")"
        );
    }
    return "";
  }

  getSoldeMouvement(e) {
    return "Solde : " + e.aggregates[0];
  }

  getSoldeGeneralRecapClient(e) {
    return "Solde général : " + e.aggregates[0];
  }

  getSoldeGeneralData(e) {
    if (e.items?.length)
      return "Solde général : " + e.items[0].sommeQuantiteInventaire;
    if (e.collapsedItems?.length)
      return "Solde général : " + e.collapsedItems[0].sommeQuantiteInventaire;
  }

  public expandCollapseGroups() {
    const index = this.getActiveGridIndex();
    const datagrid = this.paloxGrids.toArray()[index];
    if (!datagrid) return;
    datagrid.instance.option("grouping", {
      autoExpandAll: !datagrid.instance.option("grouping").autoExpandAll,
    });
  }

  public calculateSoldeRecapFou(data) {
    return data.entree - data.sortie + data.quantiteInventaire;
  }

  public calculateCustomSummary(options) {
    if (options.name === "solde_mouvement") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        if (!options.totalValue)
          options.totalValue = options.value.quantiteInventaire;
        options.totalValue += options.value.sortie - options.value.entree;
      }
    }
    if (options.name === "solde_recap") {
      if (options.summaryProcess === "start") {
        options.totalValue = 0;
      } else if (options.summaryProcess === "calculate") {
        options.totalValue +=
          options.value.entree -
          options.value.sortie -
          options.value.quantiteInventaire;
      }
    }
  }
}

export default SupervisionComptesPaloxComponent;
