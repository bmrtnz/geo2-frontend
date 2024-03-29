import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  OnInit,
  Output,
  ViewChild,
  isDevMode,
  EventEmitter
} from "@angular/core";
import { UntypedFormControl, UntypedFormGroup } from "@angular/forms";
import CommandeEdi from "app/shared/models/commande-edi.model";
import { Role } from "app/shared/models/personne.model";
import { alert, confirm } from "devextreme/ui/dialog";
import {
  AuthService,
  ClientsService,
  LocalizationService,
} from "app/shared/services";
import { OrdresEdiService } from "app/shared/services/api/ordres-edi.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import {
  DxDataGridComponent,
  DxRadioGroupComponent,
  DxSelectBoxComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, lastValueFrom, Observable } from "rxjs";
import { concatMap, map } from "rxjs/operators";
import { TabContext } from "../../../root/root.component";
import { ChoixEntrepotCommandeEdiPopupComponent } from "../choix-entrepot-commande-edi-popup/choix-entrepot-commande-edi-popup.component";
import { ModifCommandeEdiPopupComponent } from "../modif-commande-edi-popup/modif-commande-edi-popup.component";
import { VisualiserOrdresPopupComponent } from "../visualiser-ordres-popup/visualiser-ordres-popup.component";
import notify from "devextreme/ui/notify";
import { Societe } from "app/shared/models";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { GridsService } from "app/pages/ordres/grids.service";
import { RecapStockCdeEdiColibriPopupComponent } from "../recap-stock-cde-edi-colibri-popup/recap-stock-cde-edi-colibri-popup.component";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { StockArticleEdiBassinService } from "app/shared/services/api/stock-article-edi-bassin.service";
import hideToasts from "devextreme/ui/toast/hide_toasts";
import { AssocArticlesEdiColibriPopupComponent } from "app/shared/components/assoc-articles-edi-colibri-popup/assoc-articles-edi-colibri-popup.component";

enum InputField {
  clientCode = "client",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
  dateMin = "dateMin",
  dateMax = "dateMax",
  typeDate = "typeDate",
  filtreStock = "filtreStock"
}

const ALL = "%";
const DATEFORMAT = "dd/MM/yyyy HH:mm:ss";

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-commandes-edi",
  templateUrl: "./grid-commandes-edi.component.html",
  styleUrls: ["./grid-commandes-edi.component.scss"],
})
export class GridCommandesEdiComponent implements OnInit, AfterViewInit {
  public readonly env = environment;
  public clients: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;
  private dataSourceOL: DataSource;
  public periodes: any[];
  public typesDates: { key: string, description: string }[];
  public filtresStock: { key: string, description: string }[];
  public etats: any;
  public displayedEtat: string[];
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public allText: string;
  public gridTitle: string;
  public gridTitleCount: string;
  public gridTitleInput: HTMLInputElement;
  public devMode = isDevMode();
  private viewInit: boolean;
  private userParams: {
    periode: string,
    dateMin: Date,
    dateMax: Date,
    assistante: string
  }


  @Output() commandeEdi: Partial<CommandeEdi>;
  @Output() commandeEdiId: string;
  @Output() commandeId: string;
  @Output() lignesOrdreIds: string[];
  @Output() ordresNumeros: string[];
  @Output() public showHideLoader = new EventEmitter();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;
  @ViewChild("typeDatesSB", { static: false }) typeDatesSB: DxSelectBoxComponent;
  @ViewChild("filtreStockSB", { static: false }) filtreStockSB: DxSelectBoxComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("etatRB", { static: false }) etatRB: DxRadioGroupComponent;
  @ViewChild(ChoixEntrepotCommandeEdiPopupComponent, { static: false })
  choixEntPopup: ChoixEntrepotCommandeEdiPopupComponent;
  @ViewChild(ModifCommandeEdiPopupComponent, { static: false })
  modifCdeEdiPopup: ModifCommandeEdiPopupComponent;
  @ViewChild(VisualiserOrdresPopupComponent, { static: false })
  visuCdeEdiPopup: VisualiserOrdresPopupComponent;
  @ViewChild(AssocArticlesEdiColibriPopupComponent, { static: false }) assocArticlesPopup: AssocArticlesEdiColibriPopupComponent;

  @ViewChild(RecapStockCdeEdiColibriPopupComponent, { static: false })
  recapStockPopup: RecapStockCdeEdiColibriPopupComponent;

  public formGroup = new UntypedFormGroup({
    clientCode: new UntypedFormControl(),
    codeAssistante: new UntypedFormControl(),
    codeCommercial: new UntypedFormControl(),
    dateMin: new UntypedFormControl(this.dateMgtService.startOfDay()),
    dateMax: new UntypedFormControl(this.dateMgtService.endOfDay()),
    typeDate: new UntypedFormControl(),
    filtreStock: new UntypedFormControl()
  } as Inputs<UntypedFormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private ordresEdiService: OrdresEdiService,
    private ordresService: OrdresService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
    public gridsService: GridsService,
    private ordreLignesService: OrdreLignesService,
    public dateManagementService: DateManagementService,
    private localization: LocalizationService,
    private datePipe: DatePipe,
    public tabContext: TabContext,
    private currentCompanyService: CurrentCompanyService,
    private dateMgtService: DateManagementService,
    public authService: AuthService,
    public functionsService: FunctionsService,
    private stockArticleEdiBassinService: StockArticleEdiBassinService,
  ) {
    this.typesDates = [
      {
        key: 'livraison',
        description: this.localization.localize("date-livraison"),
      },
      {
        key: 'creation',
        description: this.localization.localize("date-creation"),
      },
    ];
    this.filtresStock = [
      {
        key: "S",
        description: this.localization.localize("simplifie"),
      },
      {
        key: "D",
        description: this.localization.localize("detaille"),
      },
    ]
    this.formGroup.get("typeDate").setValue(this.typesDates[0].key);
    this.allText = this.localization.localize("all");
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.CommandesEdi
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));

    this.etats = [
      { caption: "Toutes", id: "%" },
      { caption: "Traitées", id: "T" },
      { caption: "Non-traitées", id: "N" },
    ];
    this.displayedEtat = this.etats.map((res) => res.caption);

    this.commerciaux = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.commerciaux.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.COMMERCIAL],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.assistantes = this.personnesService.getDataSource_v2([
      "id",
      "nomUtilisateur",
    ]);
    this.assistantes.filter([
      ["valide", "=", true],
      "and",
      ["role", "=", Role.ASSISTANT],
      "and",
      ["nomUtilisateur", "<>", "null"],
    ]);
    this.setClientDataSource();
    this.periodes = this.dateMgtService.periods();
    this.gridTitle = "Liste des commandes EDI";
  }

  ngOnInit() {
    this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );

    this.formGroup.get("filtreStock").valueChanges
      .pipe(concatMap(filtreRechercheStockEdi => this.authService.persist({ filtreRechercheStockEdi })))
      .subscribe();
  }

  ngAfterViewInit() {
    // Retrieves user params
    const params = window.localStorage.getItem("params-cde-edi");
    let config;
    if (params?.length) config = JSON.parse(params);
    if (config) {
      if (config.assistante) this.formGroup.get("codeAssistante").setValue({ id: config.assistante });
      if (config.periode) {
        this.setDefaultPeriod(config.periode);
      } else {
        this.formGroup.get("dateMin")?.setValue(config.dateMin);
        this.formGroup.get("dateMax")?.setValue(config.dateMax);
      }
    } else {
      this.setDefaultPeriod("J+1"); // Tomorrow by default
    }
    this.viewInit = true;

    const dxGridElement = this.datagrid.instance.$element()[0];
    this.gridTitleInput = dxGridElement.querySelector(
      ".dx-toolbar .grid-title input"
    );
    const initFilterStockKey = this.authService.currentUser.filtreRechercheStockEdi ?? "S";
    this.formGroup.get("filtreStock").setValue(initFilterStockKey);
  }

  displayIDBefore(data) {
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

  enableFilters() {
    this.datagrid.dataSource = null;

    const values: Inputs = {
      ...this.formGroup.value,
    };

    const requiredFields = [
      "id",
      "refEdiLigne",
      "eanProduitClient",
      "eanProduitBw",
      "eanColisClient",
      "eanColisBw",
      "operationMarketing",
      "fichierSource",
      "libelleProduit",
      "listArticleId",
      "masqueLigne",
      "masqueOrdre",
      "numeroLigne",
      "parCombien",
      "quantite",
      "prixVente",
      "quantiteColis",
      "refCmdClient",
      "status",
      "statusGeo",
      "typeColis",
      "uniteQtt",
      "version",
      "refEdiOrdre",
      "dateDocument",
      "dateLivraison",
      "client.id",
      "client.code",
      "client.raisonSocial",
      "entrepot.id",
      "entrepot.code",
      "entrepot.raisonSocial",
      "ordre.id",
      "ordre.numero",
      "ordre.campagne.id",
      "ordre.client.code",
      "ordre.type.id",
      "ordre.listeOrdresComplementaires",
      "ordre.dateDepartPrevue",
      "initBlocageOrdre",
      "verifStatusEdi",
      "prixVente",
      "codeInterneProduitClient"
    ];

    this.datagrid.instance.beginCustomLoading("");
    this.ordresEdiService
      .allCommandeEdi(
        ALL,
        this.authService.currentUser.secteurCommercial.id,
        this.authService.currentUser.nomUtilisateur,
        values.clientCode?.code || ALL,
        values.codeAssistante?.id || ALL,
        values.codeCommercial?.id || ALL,
        this.etats.filter((res) => res.caption === this.etatRB.value)[0].id,
        this.dateManagementService.startOfDay(values.dateMin),
        this.dateManagementService.endOfDay(values.dateMax),
        values.typeDate,
        requiredFields
      )
      .subscribe((res) => {
        this.datagrid.dataSource = res.data.allCommandeEdi;
        this.datagrid.instance.refresh();
        this.datagrid.instance.endCustomLoading();
      });
  }

  onFieldValueChange(e?) {
    if (e) this.enableFilters();
    this.userParams = {
      periode: this.periodeSB?.value?.id,
      dateMin: this.formGroup.get("dateMin")?.value,
      dateMax: this.formGroup.get("dateMax")?.value,
      assistante: this.formGroup.get("codeAssistante")?.value?.id
    }
    if (this.viewInit)
      window.localStorage.setItem("params-cde-edi", JSON.stringify(this.userParams));
  }

  setClientDataSource() {
    this.onFieldValueChange();

    const values: Inputs = {
      ...this.formGroup.value,
    };

    this.formGroup.get("clientCode").reset();
    this.clients = null;

    // Find all EDI clients depending on sector, assistant and commercial
    this.ordresEdiService
      .allClientEdi(
        this.authService.currentUser.secteurCommercial.id,
        values.codeAssistante?.id || ALL,
        values.codeCommercial?.id || ALL
      )
      .subscribe((res) => {
        const clientList = res.data.allClientEdi;
        if (clientList?.length) {
          const filters: any = this.authService.isAdmin ? [] : [
            [
              "secteur.id",
              "=",
              this.authService.currentUser.secteurCommercial.id,
            ],
          ];
          const filter = [];

          clientList.map((clt) => {
            filter.push(["id", "=", clt.client.id], "or");
          });
          filter.pop();
          if (filters.length) filters.push("and");
          filters.push(filter);
          this.clients = this.clientsService.getDataSource_v2([
            "code",
            "raisonSocial",
          ]);
          this.clients.filter(filters);
        }
      });
  }

  onGridContentReady(e) {
    // Orders count
    const counter = this.datagrid.instance.getDataSource()?.items()?.length;
    this.gridTitleInput.value =
      this.gridTitle + (counter ? ` (${counter})` : "");
  }

  manualDate(e) {
    this.onFieldValueChange();
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    // Checking that date period is consistent otherwise, we set the other date to the new date
    const deb = new Date(this.formGroup.get("dateMin").value);
    const fin = new Date(this.formGroup.get("dateMax").value);
    const deltaDate = fin < deb;

    if (deltaDate) {
      if (e.element.classList.contains("dateStart")) {
        this.formGroup
          .get("dateMax")
          .patchValue(this.dateMgtService.endOfDay(deb));
      } else {
        this.formGroup
          .get("dateMin")
          .patchValue(this.dateMgtService.startOfDay(fin));
      }
    }
    this.periodeSB.value = null;
  }

  setDates(e) {
    this.onFieldValueChange();
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    const datePeriod = this.dateMgtService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  refreshGrid() {
    this.datagrid.instance.refresh();
  }

  onEdiEntrepotChoosed(data, entrepot?) {
    this.runCreationProcess({ ...data, entrepot });
  }

  OnClickCreateEdiButton(data) {
    this.commandeEdi = data.items ?? data.collapsedItems;
    this.commandeEdi = this.commandeEdi[0];

    // Do we already have a specified entrepot? Otherwise, choose one
    if (this.commandeEdi.entrepot?.id) {
      this.runCreationProcess(this.commandeEdi);
    } else {
      this.choixEntPopup.visible = true;
    }
  }

  runCreationProcess(commandeEdi: Partial<CommandeEdi>) {
    hideToasts();
    this.showHideLoader.emit(true);
    notify(this.localization.localize("please-wait-order-creation"), "info", 4500);

    const genericGen = this.functionsService.ofReadOrdEdiColibri(
      parseInt(commandeEdi.refEdiOrdre),
      this.currentCompanyService.getCompany().campagne.id,
      this.formGroup.get("filtreStock").value,
    );

    const espagneGen = this.ordresEdiService.fCreateEdiEsp(
      parseInt(commandeEdi.refEdiOrdre),
      this.currentCompanyService.getCompany().id,
      commandeEdi.client.id,
      commandeEdi.entrepot.id,
      this.authService.currentUser.nomUtilisateur,
    );

    this.ordresEdiService.save_v2(["id", "entrepot.id"], {
      ediOrdre: {
        id: commandeEdi.refEdiOrdre,
        entrepot: { id: commandeEdi.entrepot.id },
      },
    })
      .pipe(
        concatMap(() => this.stockArticleEdiBassinService
          .deleteAllByOrdreEdiId(parseInt(commandeEdi.refEdiOrdre))),
        concatMap(res => this.ordresEdiService.getOne(parseInt(commandeEdi.refEdiOrdre), ["id", "secteur.id"])),
        concatMap(res => res.data.ediOrdre.secteur?.id === "ESP" ? espagneGen : genericGen),
      ).subscribe({
        error: (err: Error) => {
          hideToasts();
          this.showHideLoader.emit(false);
          const mess = this.messageFormat(err.message);
          notify(mess, "error", 5000 + 40 * mess.length);
        },
        next: async res => {
          hideToasts();
          this.showHideLoader.emit(false);
          if ("ofReadOrdEdiColibri" in res.data) {
            this.recapStockPopup.visible = true;
            this.recapStockPopup.refOrdreEDI = parseInt(commandeEdi.refEdiOrdre);
          }
          // MERCADONA (Espagne)
          if ("fCreateEdiEsp" in res.data) {
            const result = await lastValueFrom(
              this.ordresService.getOne_v2(res.data.fCreateEdiEsp.data?.tab_ordre_cree[0], ["id", "numero", "campagne.id"])
            );
            const numero = result.data?.ordre?.numero;
            const text = this.localization.localize("ordre-cree-edi", numero);
            this.tabContext.openOrdre(numero, result.data?.ordre?.campagne?.id, false);
            //Refresh datagrid with filters
            this.enableFilters();
            notify(text, "success", 10000);
          }
        }
      });
  }

  OnClickModifyEdiButton(data) {
    this.commandeEdi = data.items ?? data.collapsedItems;
    this.commandeEdiId = this.commandeEdi[0].refEdiOrdre;
    this.commandeId = this.commandeEdi[0].ordre?.id;
    this.modifCdeEdiPopup.visible = true;
  }

  OnClickViewEdiButton(data) {
    data = data.items ?? data.collapsedItems;
    this.ordresNumeros = [];
    this.lignesOrdreIds = [];
    data.map((ligne) => this.lignesOrdreIds.push(ligne.refEdiLigne));

    // Checks whether one or several orders are concerned
    // Open if unique, let the user select when multiple choice
    this.dataSourceOL = this.ordreLignesService.getDataSource_v2([
      "id",
      "ordre.numero",
      "ordre.campagne.id",
    ]);
    const filter = [];
    let ordres = [];
    this.lignesOrdreIds.map((id) =>
      filter.push(["ediLigne.id", "=", id], "or")
    );
    filter.pop();
    this.dataSourceOL.filter(filter);
    this.dataSourceOL.load().then((res) => {
      res.map((ligne) =>
        ordres.push({
          numero: ligne.ordre.numero,
          campagneId: ligne.ordre.campagne.id,
        })
      );
      ordres = [...new Map(ordres.map((v) => [v.numero, v])).values()]; // Removes duplicates
      if (ordres.length === 1) {
        notify(
          this.localization
            .localize("ouverture-ordre")
            .replace("&NO", `${ordres[0].campagneId}-${ordres[0].numero}`),
          "success",
          1500
        );
        setTimeout(() =>
          this.tabContext.openOrdre(
            ordres[0].numero,
            ordres[0].campagneId,
            false
          )
        );
      } else {
        this.visuCdeEdiPopup.visible = true;
      }
    });
  }

  onClickCreateComplEdiButton(data) {
    data = data.items ?? data.collapsedItems;
    const thatOrdre = data[0].ordre;

    if (!thatOrdre?.id) return;
    // As LIST_NORDRE_COMP is a VARCHAR(50)
    if (
      thatOrdre.listeOrdresComplementaires?.split(";").join(",").split(",")
        .length >= 8
    ) {
      notify(
        "Le nombre maximum d'ordres complémentaires est atteint",
        "error",
        5000
      );
      return;
    }
    if (thatOrdre.type.id !== "ORD") {
      alert(
        this.localization.localize("text-popup-ordre-non-ORD"),
        this.localization.localize("ordre-complementaire-creation")
      );
      return;
    }

    const dateNow = this.datePipe.transform(
      new Date().setDate(new Date().getDate()).valueOf(),
      "yyyy-MM-dd"
    );
    if (dateNow > thatOrdre.dateDepartPrevue) {
      alert(
        this.localization.localize("text-popup-ordre-compl-dateDepassee"),
        this.localization.localize("ordre-complementaire-creation")
      );
      return;
    }

    confirm(
      this.localization
        .localize("text-popup-ordre-compl")
        .replace("&C", thatOrdre.client.code),
      this.localization.localize("ordre-complementaire-creation")
    ).then((res) => {
      if (res) {
        const societe: Societe = this.currentCompanyService.getCompany();

        this.ordresService
          .fCreeOrdreComplementaire(
            thatOrdre.id,
            societe.id,
            this.authService.currentUser.nomUtilisateur
          )
          .subscribe({
            next: (resCree) => {
              const refOrdreCompl =
                resCree.data.fCreeOrdreComplementaire.data.ls_ord_ref_compl;
              if (refOrdreCompl) {
                // Find numero / Open new order
                this.ordresService
                  .getOne_v2(refOrdreCompl, ["id", "numero", "campagne.id"])
                  .subscribe({
                    next: (result) => {
                      const numOrdreCompl = result.data.ordre.numero;
                      const campOrdreCompl = result.data.ordre.campagne;

                      notify(
                        this.localization
                          .localize("ordre-complementaire-cree")
                          .replace("&O", numOrdreCompl),
                        "success",
                        7000
                      );

                      // Sauvegarde of_sauve_ordre
                      this.ordresService.ofSauveOrdre(thatOrdre.id).subscribe({
                        error: (error: Error) => {
                          alert(
                            this.messageFormat(error.message),
                            this.localization.localize(
                              "ordre-cloture-ordre-edi"
                            )
                          );
                        },
                      });

                      // Sauvegarde Statut ordre EDI
                      const ediOrdre = {
                        id: data[0].refEdiOrdre,
                        statusGeo: "T",
                      };
                      this.ordresEdiService
                        .save_v2(["id", "statusGEO"], { ediOrdre })
                        .subscribe({
                          next: () => this.enableFilters(),
                          error: (err) => {
                            notify(
                              "Erreur sauvegarde statut Geo ordre EDI",
                              "error",
                              3000
                            );
                            console.log(err);
                          },
                        });
                      // Open new order, without an opening message
                      this.tabContext.openOrdre(
                        numOrdreCompl,
                        campOrdreCompl.id,
                        false
                      );
                    },
                    error: (error: Error) => {
                      console.log(error);
                      alert(
                        this.localization.localize(
                          "ordre-regularisation-erreur-creation"
                        ),
                        this.localization.localize(
                          "ordre-complementaire-creation"
                        )
                      );
                    },
                  });
              }
            },
            error: (error: Error) => {
              console.log(error);
              alert(
                this.messageFormat(error.message),
                this.localization.localize("ordre-complementaire-creation")
              );
            },
          });
      } else {
        notify(
          this.localization.localize("text-popup-abandon-ordre-compl"),
          "warning",
          7000
        );
      }
    });
  }

  private messageFormat(mess) {
    mess = mess
      .replace("Exception while fetching data (/fCreeOrdresEdi) : ", "")
      .replace("Exception while fetching data (/ofReadOrdEdiColibri) : ", "")
      .replace("Exception while fetching data (/ofSauveOrdre) : ", "")
      .replace("Exception while fetching data (/fCreeOrdreComplementaire) : ", "");
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    mess = mess.split("%%%").join(this.localization.localize("blocking"));
    if (mess.slice(-4) === "~r~n") mess = mess.slice(0, -4); // Unuseful CR at the end
    mess = mess.split("~r~n").join("\r\n");
    return mess;
  }

  onCellPrepared(e) {
    const field = e.column.dataField;

    if (e.rowType === "group") {
      if (field === "refEdiOrdre" && e.cellElement.textContent) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];

        // Add special background color to the group row
        e.cellElement.parentElement.classList.add("group-back-color");

        // Fill left text of the group row
        // ref cmd clt - raison soc clt - raison soc entrep - Version date - Livraison
        let leftTextContent =
          data.refCmdClient + " - " + (data.client.raisonSocial ?? "");
        if (data.entrepot?.raisonSocial)
          leftTextContent += " / " + data.entrepot.raisonSocial + " ";
        leftTextContent += " - Version " + (data.version ?? "");
        leftTextContent +=
          " du " +
          this.dateMgtService.formatDate(data.dateDocument, DATEFORMAT) ?? "";
        e.cellElement.childNodes[0].children[1].innerText = leftTextContent;

        // Fill right text of the group row
        if (data.dateLivraison) {
          e.cellElement.childNodes[0].children[2].innerText =
            "Livraison : " +
            this.dateMgtService.formatDate(data.dateLivraison, DATEFORMAT) ??
            "";
        }

        // Fill indicator button text and sets its bck depending on the status
        e.cellElement.childNodes[0].children[0].innerHTML = data.status;
        e.cellElement.childNodes[0].children[0].classList.add(
          `info-${data.status}`
        );
      }
    }
    if (e.rowType === "data") {
      // Hide status on developped rows as it is shown in the group when full order list
      if (field === "status") e.cellElement.innerText = "";

      // Tooltip Descript. article
      if (field === "libelleProduit")
        e.cellElement.title = e.data.libelleProduit ?? "";
    }
  }

  showEdiOrderNumber(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return "Cde Edi " + data[0].refEdiOrdre;
  }

  showModifyEdiButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "U" && data[0].statusGeo === "N";
  }

  showCreateEdiButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "C" && data[0].statusGeo === "N";
  }

  showViewEdiButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return (
      data[0].statusGeo === "T" ||
      (data[0].initBlocageOrdre === true && data[0].verifStatusEdi === false)
    );
  }

  showCreateComplEdiButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return (
      data[0].status === "U" &&
      data[0].statusGeo === "N" &&
      data[0].initBlocageOrdre === true &&
      data[0].verifStatusEdi === true
    );
  }

  setDefaultPeriod(periodId) {
    let myPeriod = this.dateManagementService.getPeriodFromId(
      periodId,
      this.periodes
    );
    if (!myPeriod) return;
    this.periodeSB?.instance.option("value", myPeriod);
    const datePeriod = this.dateManagementService.getDates({
      value: myPeriod,
    });
    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  openArticles() {
    this.assocArticlesPopup.visible = true;
  }
}

export default GridCommandesEdiComponent;
