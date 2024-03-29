import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import grids from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import DataSource from "devextreme/data/data_source";
import { dxButtonOptions } from "devextreme/ui/button";
import { Observable } from "rxjs";
import { Model, ModelFieldOptions } from "../models/model";
import Ordre from "../models/ordre.model";
import {
  Indicateur,
  IndicateurCountResponse,
  IndicateursService,
} from "./api/indicateurs.service";
import { Operation, OrdresService } from "./api/ordres.service";
import { PaysDepassementService } from "./api/pays-depassement.service";
import { PaysService } from "./api/pays.service";
import { AuthService } from "./auth.service";
import { CurrentCompanyService } from "./current-company.service";

export const INDEX_TAB = "INDEX";
export class Content {
  id?: string;
  tabTitle: string;
  ordre?: Ordre;
  patch?: Ordre;
}

const contents: Content[] = [
  {
    id: INDEX_TAB,
    tabTitle: "Suivi des ordres",
  },
];

// @ts-ignore
export class Indicator implements dxButtonOptions {
  id: string;
  enabled?: boolean;
  number?: string;
  parameter: string;
  subParameter: string;
  filter?: any[];
  tileBkg: string;
  indicatorIcon: string;
  warningIcon: string;
  loading: boolean;
  withCount?: boolean;
  fetchCount?: Observable<IndicateurCountResponse>;
  dataSource?: DataSource;
  regExpSelection?: RegExp;
  explicitSelection?: Array<string>;
  component?: Promise<any>;
  detailedFields?:
    | Observable<
      ModelFieldOptions<typeof Model> | ModelFieldOptions<typeof Model>[]
    >
    | GridColumn[];
  constructor(args) {
    Object.assign(this, args);
  }
  cloneFilter?(): any[] {
    return JSON.parse(JSON.stringify(this.filter));
  }
  cloneFilterLignes?(): any[] {
    return JSON.parse(
      JSON.stringify(this.filter)
        .replace("valide", "ordre.valide")
        .replace("societe", "ordre.societe")
    );
  }
}

const indicators: Indicator[] = [
  {
    id: "SuiviDesOrdres",
    enabled: true,
    parameter: "Suivi",
    subParameter: "des ordres",
    tileBkg: "#01AA9B",
    indicatorIcon: "material-icons search",
    warningIcon: "",
    component: import("../../pages/ordres/suivi/ordres-suivi.component"),
  },
  {
    id: "SupervisionLivraison",
    enabled: false,
    withCount: true,
    parameter: "Supervision",
    subParameter: "livraison",
    tileBkg: "#9199B4",
    indicatorIcon: "material-icons directions",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/supervision-livraison/supervision-livraison.component"
    ),
  },
  {
    id: Indicateur.ClientsDepassementEncours,
    enabled: true,
    withCount: true,
    parameter: "Dépassements",
    subParameter: "En-cours clients",
    tileBkg: "#4199B4",
    indicatorIcon: "material-icons people",
    warningIcon: "material-icons warning",
    component: import(
      "../../pages/ordres/indicateurs/clients-dep-encours/clients-dep-encours.component"
    ),
    /* eslint-disable-next-line  max-len */
    explicitSelection: [
      "id",
      "pays.description",
      "clientsSommeAgrement",
      "clientsSommeEnCoursTemporaire",
      "clientsSommeEnCoursBlueWhale",
      "clientsSommeAutorise",
      "clientsSommeDepassement",
      "clientsSommeEnCoursActuel",
      "clientsSommeEnCoursNonEchu",
      "clientsSommeEnCours1a30",
      "clientsSommeEnCours31a60",
      "clientsSommeEnCours61a90",
      "clientsSommeEnCours90Plus",
      "clientsSommeAlerteCoface",
    ],
  },
  {
    id: Indicateur.OrdresNonConfirmes,
    enabled: true,
    withCount: true,
    parameter: "Ordres",
    subParameter: "non confirmés",
    tileBkg: "#5A6382",
    indicatorIcon: "material-icons pending",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/ordres-non-confirmes/ordres-non-confirmes.component"
    ),
    // eslint-disable-next-line max-len
    explicitSelection: [
      "id",
      "numero",
      "referenceClient",
      "codeChargement",
      "dateDepartPrevue",
      "dateLivraisonPrevue",
      "codeClient",
      "codeAlphaEntrepot",
      "dateCreation",
      "typeId",
      "client.raisonSocial",
      "secteurCode",
      "entrepot.raisonSocial",
      "campagneId",
      "numeroContainer",
      "transporteurId",
      "dateCreation",
      "numeroContainer",
      "codeChargement",
      "totalNombrePalettesCommandees",
      "sommeColisCommandes"
    ],
    /* eslint-disable-next-line  max-len */
    select:
      /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|totalNombrePalettesCommandees|secteurCommercial\.id|codeChargement|entrepot\.raisonSocial|campagne\.id|numeroContainer)$/,
  },
  {
    id: "PlanningTransporteurs",
    enabled: true,
    withCount: false,
    parameter: "Planning",
    subParameter: "Transporteurs",
    tileBkg: "#1B715C",
    indicatorIcon: "material-icons departure_board",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/planning-transporteurs/planning-transporteurs.component"
    ),
  },
  {
    id: "PlanningTransporteursApproche",
    enabled: false,
    withCount: false,
    parameter: "Planning",
    subParameter: "Transporteurs d'approche",
    tileBkg: "#D9920A",
    indicatorIcon: "material-icons departure_board",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/planning-transporteurs-approche/planning-transporteurs-approche.component"
    ),
  },
  {
    id: "PlanningFournisseurs",
    enabled: true,
    withCount: false,
    parameter: "Planning",
    subParameter: "Fournisseurs",
    tileBkg: "#004173",
    indicatorIcon: "material-icons event_note",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/planning-fournisseurs/planning-fournisseurs.component"
    ),
  },
  {
    id: "SupervisionComptesPalox",
    enabled: true,
    withCount: false,
    parameter: "Supervision",
    subParameter: "Comptes palox",
    tileBkg: "#E12057",
    indicatorIcon: "material-icons view_in_ar",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/supervision-comptes-palox/supervision-comptes-palox.component"
    ),
  },
  {
    id: "SupervisionAFacturer",
    enabled: true,
    withCount: false,
    parameter: "Ordres",
    subParameter: "à facturer",
    tileBkg: "#725828",
    indicatorIcon: "material-icons verified",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/supervision-a-facturer/supervision-a-facturer.component"
    ),
  },
  {

    id: "CommandesEdi",
    enabled: false,
    withCount: false,
    parameter: "Commandes",
    subParameter: "EDI",
    tileBkg: "#0258A8",
    indicatorIcon: "material-icons article",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/commandes-edi/commandes-edi.component"
    ),
  },
  {
    id: Indicateur.LitigeOuvert,
    enabled: true,
    withCount: true,
    parameter: "Litiges",
    subParameter: "en cours",
    tileBkg: "#EE6265",
    indicatorIcon: "material-icons offline_bolt",
    warningIcon: "material-icons warning",
    component: import(
      "../../pages/ordres/indicateurs/litiges/litiges-supervision.component"
    ),
  },
  {
    id: "Stock",
    enabled: false,
    parameter: "Stock",
    subParameter: "dispo",
    tileBkg: "#60895E",
    indicatorIcon: "box",
    warningIcon: "",
  },
  {
    id: Indicateur.PlanningDepart,
    enabled: true,
    withCount: true,
    parameter: "Planning",
    subParameter: "Départs",
    tileBkg: "#71BF45",
    indicatorIcon: "material-icons calendar_today",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/planning-depart/planning-depart.component"
    ),
    explicitSelection: [
      "ordre.id",
      "ordre.dateLivraisonPrevue",
      "ordre.sommeColisCommandes",
      "ordre.sommeColisExpedies",
      "ordre.numero",
      "ordre.codeClient",
      "ordre.codeAlphaEntrepot",
      "ordre.versionDetail",
      "ordre.campagne.id",
      "id",
      "logistique.fournisseur.code",
      "logistique.expedieStation",
      "logistique.dateDepartReelleFournisseur",
      "nombreColisCommandes",
      "nombreColisExpedies",
      "logistique.fournisseurReferenceDOC",
      "logistique.okStation",
      "ordre.assistante.id",
      "ordre.commercial.id",
      "ordre.referenceClient",
      "ordre.transporteur.id",
      "ordre.codeChargement",
      "ordre.userModification",
    ],
  },
  {
    id: "CommandesTransit",
    enabled: false,
    withCount: true,
    parameter: "Commandes",
    subParameter: "en transit",
    tileBkg: "#8E4A21",
    indicatorIcon: "material-icons local_shipping",
    warningIcon: "",
  },
  {
    id: "histoOrdres",
    enabled: true,
    withCount: false,
    parameter: "Historique",
    subParameter: "des ordres",
    tileBkg: "#BF9126",
    indicatorIcon: "material-icons hourglass_bottom",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/historique-ordres/historique-ordres.component"
    ),
  },
  {
    id: "PlanningMaritime",
    enabled: true,
    withCount: false,
    parameter: "Planning",
    subParameter: "Maritime",
    tileBkg: "#225AA8",
    indicatorIcon: "material-icons directions_boat",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/planning-maritime/planning-maritime.component"
    ),
  },
  {
    id: Indicateur.DelarationFraude,
    enabled: true,
    withCount: false,
    parameter: "Déclaration",
    subParameter: "Fraude",
    tileBkg: "#a34527",
    indicatorIcon: "material-icons beenhere",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/declaration-fraude/declaration-fraude.component"
    ),
  },
  {
    id: "RepartitionOrdresRegroupement",
    enabled: true,
    withCount: false,
    parameter: "Répartition ordres",
    subParameter: "de regroupement",
    tileBkg: "#8E39C6DF",
    indicatorIcon: "material-icons account_tree",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/repartition-ordres-regroupement/repartition-ordres-regroupement.component"
    ),
  },
].map((indicator) => ({ ...indicator, loading: false }));

@Injectable()
export class OrdresIndicatorsService {
  private indicators = indicators;

  constructor(
    private datePipe: DatePipe,
    private authService: AuthService,
    public currentCompanyService: CurrentCompanyService,
    private ordresService: OrdresService,
    private paysService: PaysService,
    private paysDepassementService: PaysDepassementService,
    private indicateursService: IndicateursService
  ) {
    this.updateIndicators();
  }

  updateIndicators() {
    this.indicators = this.indicators.map((indicator) => {
      const instance = new Indicator(indicator);

      // Filtres communs
      instance.filter = [
        ["valide", "=", true],
        "and",
        ["societeCode", "=", this.currentCompanyService.getCompany()?.id],
      ];

      // Supervision livraison
      if (instance.id === "SupervisionLivraison") {
        instance.filter = [
          ...instance.filter,
          "and",
          ["codeClient", "<>", "PREORDRE%"],
        ];
      }

      // Ordres clients depassement en cours
      if (instance.id === Indicateur.ClientsDepassementEncours) {
        instance.detailedFields = this.paysService.model.getDetailedFields(
          1,
          instance.regExpSelection,
          { forceFilter: true }
        );
        instance.filter = [
          ["valide", "=", true],
          "and",
          [
            "clients.societe.id",
            "=",
            this.currentCompanyService.getCompany()?.id,
          ],
          "and",
          ["clients.depassement", ">", 0],
          "and",
          ["clients.valide", "=", true],
        ];
        instance.dataSource = this.paysService.getDistinctListDataSource(
          instance.explicitSelection,
          instance.filter
        );
        instance.fetchCount = this.indicateursService.countByIndicators(
          Indicateur.ClientsDepassementEncours
        );
      }

      // Ordres non confirmés
      if (instance.id === Indicateur.OrdresNonConfirmes) {

        instance.dataSource = this.ordresService.getDataSource_v2(
          instance.explicitSelection,
          Operation.NonConfirmes,
        );
        instance.filter = [
          ...instance.filter,
        ];
        instance.fetchCount = this.indicateursService.countByIndicators(
          Indicateur.OrdresNonConfirmes
        );
      }

      // Litiges
      if (instance.id === Indicateur.LitigeOuvert) {
        // // Model LitigeLigne
        // instance.filter = [["valide", "=", true]];
        // if (this.authService.currentUser.limitationSecteur) {
        //   instance.filter.push("and");
        //   instance.filter.push([
        //     "litige.ordreOrigine.secteurCommercial.id",
        //     "=",
        //     this.authService.currentUser.secteurCommercial.id,
        //   ]);
        // }
        instance.fetchCount = this.indicateursService.countByIndicators(
          Indicateur.LitigeOuvert
        );
      }

      // Planning departs
      if (instance.id === Indicateur.PlanningDepart) {
        const currDateTime24 = new Date();
        currDateTime24.setHours(23, 59, 59, 999);
        // instance.dataSource = this.ordresService.getSuiviDepartsDatasource(instance.explicitSelection);
        instance.fetchCount = this.indicateursService.countByIndicators(
          Indicateur.PlanningDepart
        );
        instance.filter = [
          ["valide", "=", true],
          "and",
          [
            "logistique.dateDepartPrevueFournisseur",
            "<=",
            currDateTime24.toISOString(),
          ],
        ];
      }

      // Planning transporteurs
      if (instance.id === "PlanningTransporteurs") {
        // Need to see all companies (Léa/Stéphane 01-12-2021)
        instance.filter = [["valide", "=", true]];
        instance.detailedFields = grids["planning-transporteurs"].columns;
        instance.dataSource = this.ordresService.getDataSource_v2(
          instance.detailedFields.map((field) => field.dataField)
        );
      }

      // Planning fournisseurs
      if (instance.id === "PlanningFournisseurs") {
        // Need to see all companies (Léa 21-10-2022)
        instance.filter = [["valide", "=", true]];
      }

      // Commandes en transit
      if (instance.id === "CommandesTransit") {
        instance.filter = [...instance.filter];
      }

      if (instance.id === "RepartitionOrdresRegroupement") {
        instance.detailedFields = grids["ordres-regroupement"].columns;
      }

      return instance;
    });
  }

  getContents() {
    return contents;
  }
  getIndicators(): Indicator[] {
    this.updateIndicators();
    // Some indicators can be disabled
    // Meaning that they won't be shown on tile view
    // But can be launched from elsewhere
    // E.g. Commandes Edi
    return this.indicators.filter((indicator) => indicator.enabled);
  }

  getIndicatorByName(name: string) {
    this.updateIndicators();
    return this.indicators.find((i) => i?.id === name);
  }

  getIndicatorDisplayById(name: string) {
    this.updateIndicators();
    const ind = this.indicators.find((i) => i?.id === name);
    return ind.parameter + ind.subParameter;
  }

  getFormatedDate(date, dateFormat?) {
    dateFormat = dateFormat || "yyyy-MM-dd";
    return this.datePipe.transform(date, dateFormat);
  }

  public getCounts() {
    const indicatorsID = this.getIndicators()
      .filter((i) => i.withCount)
      .map((i) => i.id as Indicateur);
    return this.indicateursService.countByIndicators(...indicatorsID);
  }
}
