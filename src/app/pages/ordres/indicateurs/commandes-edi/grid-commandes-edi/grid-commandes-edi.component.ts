import { DatePipe } from "@angular/common";
import { AfterViewInit, Component, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import CommandeEdi from "app/shared/models/commande-edi.model";
import { Role } from "app/shared/models/personne.model";
import { alert, confirm } from "devextreme/ui/dialog";
import {
  AuthService, ClientsService, LocalizationService
} from "app/shared/services";
import { OrdresEdiService } from "app/shared/services/api/ordres-edi.service";
import { PersonnesService } from "app/shared/services/api/personnes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid, GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxRadioGroupComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../../root/root.component";
import { ChoixEntrepotCommandeEdiPopupComponent } from "../choix-entrepot-commande-edi-popup/choix-entrepot-commande-edi-popup.component";
import { ModifCommandeEdiPopupComponent } from "../modif-commande-edi-popup/modif-commande-edi-popup.component";
import { VisualiserOrdresPopupComponent } from "../visualiser-ordres-popup/visualiser-ordres-popup.component";
import notify from "devextreme/ui/notify";
import { Societe } from "app/shared/models";
import { OrdresService } from "app/shared/services/api/ordres.service";

enum InputField {
  clientCode = "client",
  codeCommercial = "commercial",
  codeAssistante = "assistante",
  dateMin = "dateMin",
  dateMax = "dateMax",
}

const ALL = "%";
const DATEFORMAT = "dd/MM/yyyy HH:mm:ss";

type Inputs<T = any> = { [key in keyof typeof InputField]: T };

@Component({
  selector: "app-grid-commandes-edi",
  templateUrl: "./grid-commandes-edi.component.html",
  styleUrls: ["./grid-commandes-edi.component.scss"]
})
export class GridCommandesEdiComponent implements OnInit, OnChanges, AfterViewInit {
  public readonly env = environment;
  public clients: DataSource;
  public commerciaux: DataSource;
  public assistantes: DataSource;
  public periodes: string[];
  public etats: any;
  public displayedEtat: string[];
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public allText: string;
  public gridTitle: string;
  public gridTitleCount: string;
  public gridTitleInput: HTMLInputElement;
  toRefresh: boolean;

  @Output() commandeEDI: Partial<CommandeEdi>;
  @Output() commandeEDIId: string;
  @Output() lignesOrdreIds: string[];
  @Output() ordresIds: string[];

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("periodeSB", { static: false }) periodeSB: DxSelectBoxComponent;
  @ViewChild("etatRB", { static: false }) etatRB: DxRadioGroupComponent;
  @ViewChild(ChoixEntrepotCommandeEdiPopupComponent, { static: false }) choixEntPopup: ChoixEntrepotCommandeEdiPopupComponent;
  @ViewChild(ModifCommandeEdiPopupComponent, { static: false }) modifCdeEdiPopup: ModifCommandeEdiPopupComponent;
  @ViewChild(VisualiserOrdresPopupComponent, { static: false }) visuCdeEdiPopup: VisualiserOrdresPopupComponent;

  public formGroup = new FormGroup({
    clientCode: new FormControl(),
    codeAssistante: new FormControl(),
    codeCommercial: new FormControl(),
    dateMin: new FormControl(this.dateMgtService.startOfDay()),
    dateMax: new FormControl(this.dateMgtService.endOfDay()),
  } as Inputs<FormControl>);

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private ordresEdiService: OrdresEdiService,
    private ordresService: OrdresService,
    private personnesService: PersonnesService,
    private clientsService: ClientsService,
    private localization: LocalizationService,
    private datePipe: DatePipe,
    public tabContext: TabContext,
    private currentCompanyService: CurrentCompanyService,
    private dateMgtService: DateManagementService,
    public authService: AuthService,
  ) {
    this.allText = this.localization.localize("all");
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.CommandesEdi,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );

    this.etats = [
      { caption: "Toutes", id: "%" },
      { caption: "Traitées", id: "T" },
      { caption: "Non-traitées", id: "N" }
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

  async ngOnInit() {
    this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );

    const d = new Date("2022-04-02T00:00:00"); // A VIRER !!
    this.formGroup.get("dateMin").setValue(d); // A VIRER !!
    const f = new Date("2022-04-02T23:59:59"); // A VIRER !!
    this.formGroup.get("dateMax").setValue(f); // A VIRER !!
  }

  ngOnChanges() { }

  ngAfterViewInit() {
    const dxGridElement = this.datagrid.instance.$element()[0];
    this.gridTitleInput = dxGridElement.querySelector(".dx-toolbar .grid-title input");
    this.etatRB.value = this.displayedEtat[0]; // A VIRER !!
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

    this.toRefresh = false;
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
      "verifStatusEdi"
    ];

    this.datagrid.instance.beginCustomLoading("");
    this.ordresEdiService.allCommandeEdi(
      ALL,
      this.authService.currentUser.secteurCommercial.id,
      values.clientCode?.code || ALL,
      values.codeAssistante?.id || ALL,
      values.codeCommercial?.id || ALL,
      this.etats.filter((res) => res.caption === this.etatRB.value)[0].id,
      values.dateMin,
      values.dateMax,
      requiredFields
    ).subscribe((res) => {
      this.datagrid.dataSource = res.data.allCommandeEdi;
      this.datagrid.instance.refresh();
      this.datagrid.instance.endCustomLoading();
    });

  }

  onFieldValueChange(e?) {
    if (e) {
      this.enableFilters();
    } else {
      this.toRefresh = true;
    }
  }

  setClientDataSource() {
    this.onFieldValueChange();

    const values: Inputs = {
      ...this.formGroup.value,
    };

    this.formGroup.get("clientCode").reset();
    this.clients = null;

    // Find all EDI clients depending on sector, assistant and commercial
    this.ordresEdiService.allClientEdi(
      this.authService.currentUser.secteurCommercial.id,
      values.codeAssistante?.id || ALL,
      values.codeCommercial?.id || ALL
    ).subscribe((res) => {
      const clientList = res.data.allClientEdi;
      if (clientList?.length) {
        const filters: any = [["secteur.id", "=", this.authService.currentUser.secteurCommercial.id]];
        const filter = [];
        clientList.map(clt => {
          filter.push(["id", "=", clt.id], "or");
        });
        filter.pop();
        filters.push("and", filter);
        this.clients = this.clientsService.getDataSource_v2(["code", "raisonSocial"]);
        this.clients.filter(filters);
      }
    });

  }

  onGridContentReady(e) {
    // Orders count
    const counter = this.datagrid.instance.getDataSource()?.items()?.length;
    this.gridTitleInput.value = this.gridTitle + (counter ? ` (${counter})` : "");
  }

  manualDate(e) {
    // We check that this change is coming from the user, not following a period change
    if (!e.event) return;

    this.onFieldValueChange();

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
    // We check that this change is coming from the user, not following a prog change
    if (!e.event) return;

    this.onFieldValueChange();

    const datePeriod = this.dateMgtService.getDates(e);

    this.formGroup.patchValue({
      dateMin: datePeriod.dateDebut,
      dateMax: datePeriod.dateFin,
    });
  }

  createEDIOrder(data, entrId?) {

    // Add entrepot to commande EDI data
    if (entrId) data = { ...data, entrepot: { id: entrId } };

    this.ordresEdiService
      .fCreeOrdresEdi(
        this.currentCompanyService.getCompany().id,
        data.entrepot.id,
        this.datePipe.transform(data.dateLivraison, "dd/MM/yyyy"),
        this.currentCompanyService.getCompany().campagne.id,
        data.refCmdClient,
        data.client.id,
        data.refEdiOrdre,
        this.authService.currentUser.nomUtilisateur
      )
      .subscribe({
        next: (res) => {
          const result = res.data.fCreeOrdresEdi.data;
          const numeros = result?.tab_ordre_cree;
          const refs = result?.ls_nordre_tot;
          if (!numeros?.length || !refs) {
            notify("Erreur lors de la création de l'ordre", "error");
            console.log(result);
            return;
          }
          // const refs = "1976517,1038117,"; // A VIRER !!!
          // const numeros = ["700362", "242975"]; // A VIRER !!!
          if (numeros.length === 1) {
            notify(this.localization.localize("ordre-cree").replace("&O", numeros[0]), "success", 7000);
            this.tabContext.openOrdre(numeros[0], this.currentCompanyService.getCompany().campagne.id, false);
          } else {
            this.lignesOrdreIds = [];
            this.ordresIds = refs.split(",");
            this.ordresIds.pop();
            this.visuCdeEdiPopup.visible = true;
          }
        },
        error: (error: Error) => {
          console.log(error);
          alert(this.messageFormat(error.message), this.localization.localize("ordre-edi-creation"));
        }
      });

  }

  OnClickCreateEDIButton(data) {
    this.commandeEDI = data.items ?? data.collapsedItems;
    this.commandeEDI = this.commandeEDI[0];

    // Do we already have a specified entrepot? Otherwise, choose one
    if (this.commandeEDI.entrepot?.id) {
      this.createEDIOrder(this.commandeEDI);
    } else {
      this.choixEntPopup.visible = true;
    }
  }

  OnClickModifyEDIButton(data) {
    this.commandeEDI = data.items ?? data.collapsedItems;
    this.commandeEDIId = this.commandeEDI[0].refEdiOrdre;
    this.modifCdeEdiPopup.visible = true;
  }

  OnClickViewEDIButton(data) {
    data = data.items ?? data.collapsedItems;
    this.ordresIds = [];
    this.lignesOrdreIds = [];
    data.map(ligne => this.lignesOrdreIds.push(ligne.refEdiLigne));
    this.visuCdeEdiPopup.visible = true;
  }

  onClickCreateComplEDIButton(data) {

    data = data.items ?? data.collapsedItems;
    const thatOrdre = data[0].ordre;

    if (!thatOrdre?.id) return;
    // As LIST_NORDRE_COMP is a VARCHAR(50)
    if (thatOrdre.listeOrdresComplementaires?.split(",").length >= 8) {
      notify("Le nombre maximum d'ordres complémentaires est atteint", "error", 5000);
      return;
    }
    if (thatOrdre.type.id !== "ORD") {
      alert(this.localization.localize("text-popup-ordre-non-ORD"), this.localization.localize("ordre-complementaire-creation"));
      return;
    }

    const dateNow = this.datePipe.transform(new Date().setDate(new Date().getDate()).valueOf(), "yyyy-MM-dd");
    if (dateNow > thatOrdre.dateDepartPrevue) {
      alert(this.localization.localize("text-popup-ordre-compl-dateDepassee"), this.localization.localize("ordre-complementaire-creation"));
      return;
    }

    confirm(
      this.localization.localize("text-popup-ordre-compl").replace("&C", thatOrdre.client.code),
      this.localization.localize("ordre-complementaire-creation")
    ).then(res => {
      if (res) {

        const societe: Societe = this.currentCompanyService.getCompany();

        this.ordresService
          .fCreeOrdreComplementaire(thatOrdre.id, societe.id, this.authService.currentUser.nomUtilisateur)
          .subscribe({
            next: (resCree) => {
              const refOrdreCompl = resCree.data.fCreeOrdreComplementaire.data.ls_ord_ref_compl;
              const currOrder = thatOrdre;
              if (refOrdreCompl) {
                // Find numero / adjust listeOrdresComplementaires & save it / Open new order
                this.ordresService
                  .getOne_v2(refOrdreCompl, ["id", "numero", "campagne.id"])
                  .subscribe((result) => {
                    const numOrdreCompl = result.data.ordre.numero;
                    const campOrdreCompl = result.data.ordre.campagne;
                    let listOrdCompl = currOrder.listeOrdresComplementaires;

                    if (!listOrdCompl) listOrdCompl = "";
                    listOrdCompl += `${numOrdreCompl},`;

                    const ordre = { id: currOrder.id, listeOrdresComplementaires: listOrdCompl };
                    this.ordresService.save_v2(["id", "listeOrdresComplementaires"], { ordre }).subscribe({
                      next: () => {
                        notify(this.localization.localize("ordre-complementaire-cree").replace("&O", numOrdreCompl), "success", 7000);
                        ////////////////////////////////////////////
                        // Sauvegarde Statut à implémenter
                        ////////////////////////////////////////////

                        // Open new order, without an opening message
                        this.tabContext.openOrdre(numOrdreCompl, campOrdreCompl.id, false);
                      },
                      error: (err) => {
                        notify("Erreur sauvegarde liste ordres complémentaires", "error", 3000);
                        console.log(err);
                      }
                    });
                  });
              }
            },
            error: (error: Error) => {
              console.log(error);
              alert(this.messageFormat(error.message), this.localization.localize("ordre-complementaire-creation"));
            }
          });

      } else {
        notify(this.localization.localize("text-popup-abandon-ordre-compl"), "warning", 7000);
      }
    });

  }

  private messageFormat(mess) {
    mess = mess
      .replace("Exception while fetching data (/fCreeOrdresEdi) : ", "")
      .replace("Exception while fetching data (/fCreeOrdreComplementaire) : ", "");
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
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
          data.refCmdClient + " - " +
          (data.client.raisonSocial ?? "");
        if (data.entrepot?.raisonSocial) leftTextContent += " / " + data.entrepot.raisonSocial + " ";
        leftTextContent += " - Version " + (data.version ?? "");
        leftTextContent += " du " + this.dateMgtService.formatDate(data.dateDocument, DATEFORMAT) ?? "";
        e.cellElement.childNodes[0].children[1].innerText = leftTextContent;

        // Fill right text of the group row
        e.cellElement.childNodes[0].children[2].innerText =
          "Livraison : " + this.dateMgtService.formatDate(data.dateLivraison, DATEFORMAT) ?? "";

        // Fill indicator button text and sets its bck depending on the status
        e.cellElement.childNodes[0].children[0].innerHTML = data.status;
        e.cellElement.childNodes[0].children[0].classList.add(`info-${data.status}`);
      }
    }
    if (e.rowType === "data") {
      // Hide status on developped rows as it is shown in the group when full order list
      if (field === "status") e.cellElement.innerText = "";

      // Tooltip Descript. article
      if (field === "libelleProduit") e.cellElement.title = e.data.libelleProduit ?? "";
    }

  }

  showModifyEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "U" && data[0].statusGeo === "N";
  }

  showCreateEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "C" && data[0].statusGeo === "N";
  }

  showViewEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].statusGeo === "T" ||
      (data[0].initBlocageOrdre === true && data[0].verifStatusEdi === false);
  }

  showCreateComplEDIButton(cell) {
    const data = cell.data.items ?? cell.data.collapsedItems;
    return data[0].status === "U" &&
      data[0].statusGeo === "N" &&
      data[0].initBlocageOrdre === true &&
      data[0].verifStatusEdi === true;
  }

}

export default GridCommandesEdiComponent;
