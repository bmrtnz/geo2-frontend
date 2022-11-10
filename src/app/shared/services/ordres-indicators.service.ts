import { DatePipe } from "@angular/common";
import { Injectable } from "@angular/core";
import { ApolloQueryResult } from "@apollo/client/core";
import grids from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import DataSource from "devextreme/data/data_source";
import { dxButtonOptions } from "devextreme/ui/button";
import { Observable } from "rxjs";
import { Role } from "../models";
import { Model, ModelFieldOptions } from "../models/model";
import Ordre from "../models/ordre.model";
import { Indicateur, IndicateursService } from "./api/indicateurs.service";
import {
  CountResponse as CountResponseOrdre,
  Operation,
  OrdresService
} from "./api/ordres.service";
import { PaysDepassementService } from "./api/pays-depassement.service";
import {

  PaysService
} from "./api/pays.service";
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
  fetchCount?: (dxFilter?: any[]) => Observable<ApolloQueryResult<any>>;
  useCountV2?: boolean;
  dataSource?: DataSource;
  regExpSelection?: RegExp;
  explicitSelection?: Array<string>;
  component?: Promise<any>;
  detailedFields?:
    | Observable<
      | ModelFieldOptions<typeof Model>
      | ModelFieldOptions<typeof Model>[]
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
        .replace("societe", "ordre.societe"),
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
    indicatorIcon: "material-icons euro_symbol",
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
    id: "BonsAFacturer",
    enabled: false,
    withCount: true,
    parameter: "Bons",
    subParameter: "à facturer",
    tileBkg: "#01779B",
    indicatorIcon: "material-icons list_alt",
    warningIcon: "material-icons warning",
    component: import(
      "../../pages/ordres/indicateurs/bon-a-facturer/bon-a-facturer.component"
    ),
  },
  {
    id: Indicateur.ClientsDepassementEncours,
    useCountV2: true,
    enabled: true,
    withCount: true,
    parameter: "Clients",
    subParameter: "en dépassement encours",
    tileBkg: "#4199B4",
    indicatorIcon: "material-icons people",
    warningIcon: "material-icons warning",
    component: import(
      "../../pages/ordres/indicateurs/clients-dep-encours/clients-dep-encours.component"
    ),
    /* tslint:disable-next-line max-line-length */
    explicitSelection: ["id", "pays.description", "clientsSommeAgrement", "clientsSommeEnCoursTemporaire", "clientsSommeEnCoursBlueWhale", "clientsSommeAutorise", "clientsSommeDepassement", "clientsSommeEnCoursActuel", "clientsSommeEnCoursNonEchu", "clientsSommeEnCours1a30", "clientsSommeEnCours31a60", "clientsSommeEnCours61a90", "clientsSommeEnCours90Plus", "clientsSommeAlerteCoface"]
  },
  {
    id: "OrdresNonClotures",
    enabled: false,
    withCount: true,
    parameter: "Ordres",
    subParameter: "non clôturés",
    tileBkg: "#F26C5A",
    indicatorIcon: "material-icons lock_open",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/ordres-non-clotures/ordres-non-clotures.component"
    ),
    /* tslint:disable-next-line max-line-length */
    select: /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|type|client\.raisonSocial|secteurCommercial\.id|entrepot\.raisonSocial|campagne\.id)$/,
  },
  {
    id: "OrdresNonConfirmes",
    enabled: true,
    withCount: true,
    parameter: "Ordres",
    subParameter: "non confirmés",
    tileBkg: "#5A6382",
    indicatorIcon: "material-icons remove_done",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/ordres-non-confirmes/ordres-non-confirmes.component"
    ),
    // tslint:disable-next-line: max-line-length
    explicitSelection: ["id", "numero", "referenceClient", "dateDepartPrevue", "dateLivraisonPrevue", "codeClient", "codeAlphaEntrepot", "dateCreation", "type.id", "client.raisonSocial", "secteurCommercial.id", "entrepot.raisonSocial", "campagne.id", "numeroContainer"],
    /* tslint:disable-next-line max-line-length */
    select: /^(?:numero|referenceClient|dateDepartPrevue|dateLivraisonPrevue|codeClient|codeAlphaEntrepot|totalNombrePalettesCommandees|secteurCommercial\.id|codeChargement|entrepot\.raisonSocial|campagne\.id|numeroContainer)$/,
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
    parameter: "Supervision",
    subParameter: "ordres à facturer",
    tileBkg: "#725828",
    indicatorIcon: "material-icons list_alt",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/supervision-a-facturer/supervision-a-facturer.component"
    ),
  },
  {
    id: "Litiges",
    enabled: false,
    withCount: true,
    parameter: "Litiges",
    subParameter: "en cours",
    tileBkg: "#1B715C",
    indicatorIcon: "material-icons offline_bolt",
    warningIcon: "material-icons warning",
    component: import(
      "../../pages/ordres/indicateurs/litiges/litiges.component"
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
    id: "PlanningDepart",
    enabled: true,
    withCount: true,
    parameter: "Planning",
    subParameter: "départ",
    tileBkg: "#71BF45",
    indicatorIcon: "material-icons calendar_today",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/planning-depart/planning-depart.component"
    ),
    /* tslint:disable-next-line max-line-length */
    select: /^(?:dateLivraisonPrevue|sommeColisCommandes|sommeColisExpedies|numero|codeClient|codeAlphaEntrepot|versionDetail|campagne\.id)$/,
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
    id: "CommandesEdi",
    enabled: false,
    withCount: false,
    parameter: "Commandes",
    subParameter: "EDI",
    tileBkg: "#225AA8",
    indicatorIcon: "material-icons view_list",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/commandes-edi/commandes-edi.component"
    ),
  },
  {
    id: "histoOrdres",
    enabled: true,
    withCount: false,
    parameter: "Historique",
    subParameter: "des ordres",
    tileBkg: "#BF9126",
    indicatorIcon: "material-icons history",
    warningIcon: "",
    component: import(
      "../../pages/ordres/indicateurs/historique-ordres/historique-ordres.component"
    ),
  }
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
    private indicateursService: IndicateursService,
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
        ["societeCode", "=", this.currentCompanyService.getCompany().id],
      ];

      // Commandes EDI
      if (instance.id === "CommandesEdi") {
        instance.enabled = this.authService.currentUser.accessCommandeEdi;
      }

      // Supervision livraison
      if (instance.id === "SupervisionLivraison") {
        instance.filter = [
          ...instance.filter,
          "and",
          ["codeClient", "<>", "PREORDRE%"],
        ];
      }

      // Bon a facturer
      if (instance.id === "BonsAFacturer") {
        instance.filter = [
          ...instance.filter,
          "and",
          ["bonAFacturer", "=", false],
          "and",
          ["client.usageInterne", "<>", true],
          "and",
          [
            "dateLivraisonPrevue",
            ">=",
            this.getFormatedDate(Date.now()),
          ],
          "and",
          [
            "dateLivraisonPrevue",
            "<",
            this.datePipe.transform(
              new Date()
                .setDate(new Date().getDate() + 1)
                .valueOf(),
              "yyyy-MM-dd",
            ),
          ],
        ];
      }

      // Ordres clients depassement en cours
      if (instance.id === Indicateur.ClientsDepassementEncours) {
        instance.detailedFields =
          this.paysService.model.getDetailedFields(
            1,
            instance.regExpSelection,
            { forceFilter: true },
          );
        instance.filter = [
          ["valide", "=", true],
          "and",
          [
            "clients.societe.id",
            "=",
            this.currentCompanyService.getCompany().id,
          ],
          "and",
          ["clients.depassement", ">", 0],
          "and",
          ["clients.valide", "=", true],
        ];
        instance.dataSource = this.paysService.getDistinctListDataSource(instance.explicitSelection, instance.filter);
        instance.fetchCount = this.paysDepassementService.count.bind(this.paysDepassementService, {
          secteurCode: this.authService.currentUser.secteurCommercial.id,
          societeCode: this.currentCompanyService.getCompany().id,
        });
      }

      // Ordres non cloturés
      if (instance.id === "OrdresNonClotures") {
        const currDateTime0 = new Date();
        currDateTime0.setHours(0, 0, 0, 0);
        instance.detailedFields =
          this.ordresService.model.getDetailedFields(
            3,
            instance.regExpSelection,
            { forceFilter: true },
          );
        instance.dataSource = this.ordresService.getDataSource(
          null,
          2,
          instance.regExpSelection,
        );
        instance.filter = [
          ...instance.filter,
          "and",
          ["logistiques.typeLieuDepart", "=", "F"],
          "and",
          ["logistiques.expedieStation", "=", false],
          "and",
          ["codeClient", "notcontains", "PREORD%"],
          "and",
          [
            "dateDepartPrevue",
            ">=",
            this.datePipe.transform(
              currDateTime0
                .setDate(currDateTime0.getDate() - 180)
                .valueOf(),
              "yyyy-MM-ddTHH:mm:ss",
            ),
          ],
          "and",
          ["bonAFacturer", "=", false],
        ];
        instance.fetchCount = this.ordresService.count.bind(this.ordresService, [
          ...instance.filter,
          ...(this.authService.currentUser.secteurCommercial &&
            !this.authService.isAdmin
            ? [
              "and",
              [
                "secteurCommercial.id",
                "=",
                this.authService.currentUser.secteurCommercial
                  ?.id,
              ],
            ]
            : []),
          ...(this.authService.isAdmin
            ? []
            : [
              ...(this.authService.currentUser.personne?.role.toString() ===
                Role[Role.COMMERCIAL]
                ? [
                  "and",
                  [
                    "commercial.id",
                    "=",
                    this.authService.currentUser
                      .commercial.id,
                  ],
                ]
                : []),
              ...(this.authService.currentUser.personne?.role.toString() ===
                Role[Role.ASSISTANT]
                ? [
                  "and",
                  [
                    "assistante.id",
                    "=",
                    this.authService.currentUser
                      .assistante.id,
                  ],
                ]
                : []),
            ]),
        ]) as (
            dxFilter?: any[],
          ) => Observable<ApolloQueryResult<CountResponseOrdre>>;
      }

      // Ordres non confirmés
      if (instance.id === "OrdresNonConfirmes") {
        instance.dataSource = this.ordresService.getDataSource_v2(instance.explicitSelection);
        instance.filter = [
          ...instance.filter,
          "and",
          ["version", "isnull", "null"],
          "and",
          ["bonAFacturer", "=", false],
          "and",
          [
            "dateCreation",
            ">=",
            this.datePipe.transform(Date.now(), "yyyy-MM-dd"),
          ],
          "and",
          // Bien plus rapide que le filtre demandé sur l'indicateur 'avoir'
          // Donc on laisse sur le filtre 'historique'
          ["id", "<", "800000"],
          // ["factureAvoir", "=", FactureAvoir.AVOIR],
        ];
        instance.fetchCount = this.ordresService.count.bind(this.ordresService, [
          ...instance.filter,
          ...(this.authService.currentUser.secteurCommercial &&
            !this.authService.isAdmin
            ? [
              "and",
              [
                "secteurCode",
                "=",
                this.authService.currentUser.secteurCommercial?.id,
              ],
            ]
            : []),
          ...(this.authService.isAdmin
            ? []
            : [
              ...(this.authService.currentUser.personne?.role.toString() ===
                Role[Role.COMMERCIAL]
                ? [
                  "and",
                  [
                    "commercial.id",
                    "=",
                    this.authService.currentUser
                      .commercial.id,
                  ],
                ]
                : []),
              ...(this.authService.currentUser.personne?.role.toString() ===
                Role[Role.ASSISTANT]
                ? [
                  "and",
                  [
                    "assistante.id",
                    "=",
                    this.authService.currentUser
                      .assistante.id,
                  ],
                ]
                : []),
            ]),
        ]) as (
            dxFilter?: any[],
          ) => Observable<ApolloQueryResult<CountResponseOrdre>>;
      }

      // Litiges
      if (instance.id === "Litiges") {
        // Model LitigeLigne
        instance.filter = [["valide", "=", true]];
        if (this.authService.currentUser.limitationSecteur) {
          instance.filter.push("and");
          instance.filter.push([
            "litige.ordreOrigine.secteurCommercial.id",
            "=",
            this.authService.currentUser.secteurCommercial.id,
          ]);
        }
      }

      // Planning departs
      if (instance.id === "PlanningDepart") {
        const currDateTime24 = new Date();
        currDateTime24.setHours(23, 59, 59, 999);
        instance.detailedFields =
          this.ordresService.model.getDetailedFields(
            1,
            instance.regExpSelection,
            { forceFilter: true },
          );
        instance.dataSource = this.ordresService.getDataSource(
          Operation.SuiviDeparts,
          1,
          instance.regExpSelection,
        );
        instance.fetchCount = this.ordresService.count.bind(
          this.ordresService,
        ) as (
            dxFilter?: any[],
          ) => Observable<ApolloQueryResult<CountResponseOrdre>>;
        instance.filter = [
          ...instance.filter,
          "and",
          [
            "logistiques.dateDepartPrevueFournisseur",
            "<=",
            currDateTime24.toISOString(),
          ],
        ];
      }

      // Planning transporteurs
      if (instance.id === "PlanningTransporteurs") {
        // Need to see all companies (Léa/Stéphane 01-12-2021)
        instance.filter = [["valide", "=", true]];
        instance.detailedFields =
          grids["planning-transporteurs"].columns;
        instance.dataSource = this.ordresService.getDataSource_v2(
          instance.detailedFields.map((field) => field.dataField),
        );
        instance.fetchCount = this.ordresService.count.bind(
          this.ordresService,
        ) as (
            dxFilter?: any[],
          ) => Observable<ApolloQueryResult<CountResponseOrdre>>;
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

      return instance;
    });
  }

  getContents() {
    return contents;
  }
  getIndicators(): Indicator[] {
    this.updateIndicators();
    return this.indicators.filter((indicator) => indicator.enabled);
  }

  getIndicatorByName(name: string) {
    this.updateIndicators();
    return this.indicators.find((i) => i?.id === name);
  }

  getFormatedDate(date, dateFormat?) {
    dateFormat = dateFormat || "yyyy-MM-dd";
    return this.datePipe.transform(date, dateFormat);
  }

  public getCounts() {
    const indicatorsID = this.getIndicators()
      .filter(i => i.useCountV2)
      .map(i => i.id as Indicateur);
    return this.indicateursService.countByIndicators(...indicatorsID);
  }
}
