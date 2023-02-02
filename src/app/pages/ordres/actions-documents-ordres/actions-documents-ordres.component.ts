import { Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import { Societe } from "app/shared/models";
import Ordre from "app/shared/models/ordre.model";
import { AuthService } from "app/shared/services";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { FunctionResult } from "app/shared/services/api/functions.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxActionSheetComponent, DxPopupComponent } from "devextreme-angular";
import { environment } from "environments/environment";
import { defer, of } from "rxjs";
import { catchError, concatMap, concatMapTo, filter, map, tap } from "rxjs/operators";
import { AnnuleRemplacePopupComponent } from "../annule-remplace-popup/annule-remplace-popup.component";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";
import { GridsService } from "../grids.service";
import { ConfirmationResultPopupComponent } from "./confirmation-result-popup/confirmation-result-popup.component";
import { PackingListPopupComponent } from ".././packing-list-popup/packing-list-popup.component";
import {
  ViewDocument,
  ViewDocumentPopupComponent
} from "../../../shared/components/view-document-popup/view-document-popup.component";
import { DepotEnvoisService } from "app/shared/services/api/depot-envois.service";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-actions-documents-ordres",
  templateUrl: "./actions-documents-ordres.component.html",
  styleUrls: ["./actions-documents-ordres.component.scss"]
})
export class ActionsDocumentsOrdresComponent implements OnInit {

  @Input() public ordre: Ordre;
  @Input() public gridEnvois: GridEnvoisComponent;
  @Input() public gridCommandes: GridCommandesComponent;
  @Input() public orderConfirmationOnly: boolean;
  @Output() public flux: string;
  @Output() public myOrdre: Ordre;

  public actionsFlux: any[];
  public plusActionsFlux: any[];
  public plusActionsFluxEnabled: boolean;
  public visibleActionsNumber = 5; // Visible buttons number, others in a popup
  public currentCMR: ViewDocument;
  public CMRVisible = false;
  public actionSheetTarget: any;

  @ViewChild("actionSheet", { static: false }) actionSheet: DxActionSheetComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent, { static: false }) docsPopup: DocumentsOrdresPopupComponent;
  @ViewChild(AnnuleRemplacePopupComponent, { static: false }) remplacePopup: AnnuleRemplacePopupComponent;
  @ViewChild(ConfirmationResultPopupComponent) resultPopup: ConfirmationResultPopupComponent;
  @ViewChild(ViewDocumentPopupComponent) documentPopup: ViewDocumentPopupComponent;
  @ViewChild(PackingListPopupComponent) packingListPopup: PackingListPopupComponent;

  constructor(
    private envoisService: EnvoisService,
    private currentCompanyService: CurrentCompanyService,
    private gridsService: GridsService,
    private authService: AuthService,
    private depotEnvoisService: DepotEnvoisService,
  ) {
    this.actionsFlux = [
      { id: "ORDRE", text: "Confirmation cde", visible: true, disabled: false },
      { id: "DETAIL", text: "Détail expédition", visible: true, disabled: false },
      { id: "MINI", text: "Confirmation px achat", visible: true, disabled: false },
      //  Fake flu_code FICPOA = FICPAL + OLD
      { id: "FICPAO", text: "Editer fiches palettes", visible: true, disabled: false },
      //  Fake flu_code FICPON = FICPAL + NEW
      { id: "FICPAN", text: "Générer une traçabilité", visible: true, disabled: false },
      //  Génère un PDF, Manque le PBL, on revient vers nous plus tard
      { id: "TRACA", text: "Traçabilité", visible: true, disabled: false },
      //  Lire un PDF sur le NAS (/maddog2/geo_retour_palox/{geo_ordre.file_cmr})
      { id: "CMR", text: "Afficher CMR", visible: true, disabled: !this.ordre?.documentCMR?.isPresent },
      //  Génère un PDF (Stéphane a dit qu'on ne faisait pas)
      { id: "IMPORD", text: "Résumé de l'ordre", visible: true, disabled: false },
      { id: "BONLIV", text: "Bon de livraison", visible: true, disabled: false },
      { id: "PROFOR", text: "Pro forma", visible: true, disabled: false },
      { id: "COMINV", text: "Custom template", visible: true, disabled: false },
      { id: "PACKLIST", text: "Packing list", visible: true, disabled: false },
      //  Manque le PBL, on revient vers nous plus tard -> On ne fait pas
      // { id: "? (Relevé de factures)", text: "Relevé de factures", visible: true, disabled: true },
      //  Manque le PBL
      { id: "CUSINV", text: "Facture douanière", visible: true, disabled: true }, // Manque le PBL
      { id: "BUYCO", text: "Create Shipment (BuyCo)", visible: true, disabled: false },
      { id: "DECBOL", text: "Facture douanière BOLLORE", visible: true, disabled: false },
    ];
    this.plusActionsFlux = this.actionsFlux.slice(this.visibleActionsNumber - this.actionsFlux.length);
    this.plusActionsFlux.map(flux => {
      if (flux.disabled === false && flux.visible === true) this.plusActionsFluxEnabled = true;
    });
    // if (this.orderConfirmationOnly) this.actionsFlux = this.actionsFlux.filter(flux => flux.id === "ORDRE");
    // console.log(this.orderConfirmationOnly, this.actionsFlux);
  }

  ngOnInit(): void {
  }

  showFluxDoxOtherBtns(e) {
    this.actionSheetTarget = e.element;
    this.actionSheet.visible = !this.actionSheet.visible;
  }

  onClickSendAction(e, annulation?) {
    if (this.gridCommandes) {
      this.gridCommandes.grid.instance.saveEditData();
      // Wait until grid has been totally saved
      const saveInterval = setInterval(() => {
        if (!this.gridCommandes.grid.instance.hasEditData()) {
          clearInterval(saveInterval);
          this.sendAction(e, annulation);
        }
      }, 100);
    } else {
      this.sendAction(e, annulation);
    }
  }

  sendAction(e, annulation?) {

    // On récupère ici le code de l'action:
    this.flux = e;

    const societe: Societe = this.currentCompanyService.getCompany();
    const user = this.authService.currentUser;

    // On gère le cas des CMR à part, car c'est un fichier à afficher
    if (this.flux === "(CMR)") {
      this.currentCMR = {
        title: "Fiche CMR",
        document: this.ordre.documentCMR,
      };
      this.CMRVisible = true;
      return;
    }

    defer(() => {
      switch (this.flux) {
        case "ORDRE": {
          if (annulation) return of({ data: { res: 1 } });
          return this.envoisService.fConfirmationCommande(this.ordre.id, societe.id, user.nomUtilisateur);
        }
        case "DETAIL":
          return this.envoisService.fDocumentEnvoiDetailsExp(this.ordre.id, societe.id);
        case "MINI":
          return this.envoisService.fDocumentEnvoiConfirmationPrixAchat(this.ordre.id);
        case "FICPAO":
          return this.envoisService.fDocumentEnvoiFichesPalette(this.ordre.id);
        case "FICPAN":
          return this.envoisService.fDocumentEnvoiGenereTraca(this.ordre.id);
        case "BONLIV":
          return this.envoisService.fDocumentEnvoiBonLivraison(this.ordre.id);
        case "PROFOR":
          return of({ data: { res: 1 } }); // this.envoisService.fDocumentEnvoiProforma(this.ordre.id); // Because nothing to do
        case "COMINV":
          return this.envoisService.fDocumentEnvoiCominv(this.ordre.id);
        case "PACKLIST": {
          this.myOrdre = this.ordre;
          this.packingListPopup.visible = true;
          break;
        }
        case "BUYCO":
          return this.envoisService.fDocumentEnvoiShipmentBuyco(this.ordre.id);
        case "DECBOL":
          return this.envoisService.fDocumentEnvoiDeclarationBollore(this.ordre.id);
        case "TRACA":
          return this.pushDepotEnvoi("TRACA", this.ordre.id);
        case "IMPORD":
          return this.pushDepotEnvoi("IMPORD", this.ordre.id);
      }
    })
      .pipe(
        map(result => Object.values(result.data)[0]),
        concatMap(response => {
          // Some order lines can be deleted
          this.gridsService.reload("Commande", "SyntheseExpeditions", "DetailExpeditions");
          if (response.res === FunctionResult.Warning)
            return this.resultPopup.openAs("WARNING", response.msg);
          return of(true);
        }),
        catchError((err: Error) => this.resultPopup.openAs("ERROR", err.message)),
        filter(res => res),
        concatMapTo(this.envoisService
          .countBy(`ordre.id==${this.ordre.id} and flux.id==${this.flux} and (traite==N or traite==O or traite=isnull=null)`)),
      )
      .subscribe(res => {
        const popup = res.data.countBy && this.flux === "ORDRE" && !annulation ? "remplacePopup" : "docsPopup";
        this.docsPopup.annuleOrdre = annulation;
        this[popup].visible = true;
      });
  }

  private pushDepotEnvoi(fluxID: "TRACA" | "IMPORD", ordreID: Ordre["id"]) {
    this.depotEnvoisService.save({
      ordre: { id: ordreID },
      fluxID,
      dateDepot: new Date().toISOString(),
    }, ["id"]).subscribe({
      error: err => notify(`Erreur de demande de dépôt pour le flux ${fluxID}`, "error"),
      next: res => notify(`Demande de dépôt pour le flux ${fluxID} déposée`, "success"),
    });
  }
}
