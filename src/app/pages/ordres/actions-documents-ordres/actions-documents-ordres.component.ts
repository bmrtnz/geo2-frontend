import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ConfirmationResultPopupComponent } from "app/shared/components/confirmation-result-popup/confirmation-result-popup.component";
import Ordre from "app/shared/models/ordre.model";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { FluxEnvoisService } from "app/shared/services/flux-envois.service";
import { DxActionSheetComponent, DxPopupComponent } from "devextreme-angular";
import { concatMapTo, filter, tap } from "rxjs/operators";
import {
  ViewDocument,
  ViewDocumentPopupComponent,
} from "../../../shared/components/view-document-popup/view-document-popup.component";
import {
  LocalizationService,
} from "app/shared/services";
import { PackingListPopupComponent } from ".././packing-list-popup/packing-list-popup.component";
import { AnnuleRemplacePopupComponent } from "../annule-remplace-popup/annule-remplace-popup.component";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { GridCommandesComponent } from "../grid-commandes/grid-commandes.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";
import { GridsService } from "../grids.service";


@Component({
  selector: "app-actions-documents-ordres",
  templateUrl: "./actions-documents-ordres.component.html",
  styleUrls: ["./actions-documents-ordres.component.scss"],
})
export class ActionsDocumentsOrdresComponent {
  @Input() public ordre: Ordre;
  @Input() public gridEnvois: GridEnvoisComponent;
  @Input() public gridCommandes: GridCommandesComponent;
  @Input() public orderConfirmationOnly: boolean;
  @Output() public flux: string;
  @Output() public myOrdre: Ordre;
  @Output() public whenDone = new EventEmitter();

  public actionsFlux: any[];
  public plusActionsFlux: any[];
  public plusActionsFluxEnabled: boolean;
  public visibleActionsNumber = 5; // Visible buttons number, others in a popup
  public currentCMR: ViewDocument;
  public CMRVisible = false;
  public actionSheetTarget: any;

  @ViewChild("actionSheet", { static: false })
  actionSheet: DxActionSheetComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent, { static: false })
  docsPopup: DocumentsOrdresPopupComponent;
  @ViewChild(AnnuleRemplacePopupComponent, { static: false })
  remplacePopup: AnnuleRemplacePopupComponent;
  @ViewChild(ConfirmationResultPopupComponent)
  resultPopup: ConfirmationResultPopupComponent;
  @ViewChild(ViewDocumentPopupComponent)
  documentPopup: ViewDocumentPopupComponent;
  @ViewChild(PackingListPopupComponent)
  packingListPopup: PackingListPopupComponent;

  constructor(
    private gridsService: GridsService,
    private envoisService: EnvoisService,
    private fluxEnvoisService: FluxEnvoisService,
    private localization: LocalizationService
  ) {
    this.actionsFlux = [
      { id: "ORDRE", text: "Confirmation cde", visible: true, disabled: false },
      {
        id: "DETAIL",
        text: "Détail expédition",
        visible: true,
        disabled: false,
      },
      {
        id: "MINI",
        text: "Confirmation px achat",
        visible: true,
        disabled: false,
      },
      //  Fake flu_code FICPOA = FICPAL + OLD
      {
        id: "FICPAO",
        text: "Editer fiches palettes",
        visible: true,
        disabled: false,
      },
      //  Fake flu_code FICPON = FICPAL + NEW
      {
        id: "FICPAN",
        text: "Générer une traçabilité",
        visible: true,
        disabled: false,
      },
      //  Génère un PDF, Manque le PBL, on revient vers nous plus tard
      { id: "TRACA", text: "Traçabilité", visible: true, disabled: false },
      //  Lire un PDF sur le NAS (/maddog2/geo_retour_palox/{geo_ordre.file_cmr})
      {
        id: "CMR",
        text: "Afficher CMR",
        visible: true,
        disabled: !this.ordre?.documentCMR?.isPresent,
      },
      //  Génère un PDF (Stéphane a dit qu'on ne faisait pas)
      {
        id: "IMPORD",
        text: "Résumé de l'ordre",
        visible: true,
        disabled: false,
      },
      {
        id: "BONLIV",
        text: "Bon de livraison",
        visible: true,
        disabled: false,
      },
      { id: "PROFOR", text: "Pro forma", visible: true, disabled: false },
      { id: "COMINV", text: "Custom template", visible: true, disabled: false },
      { id: "PACKLIST", text: "Packing list", visible: true, disabled: false },
      //  Manque le PBL, on revient vers nous plus tard -> On ne fait pas
      // { id: "? (Relevé de factures)", text: "Relevé de factures", visible: true, disabled: true },
      {
        id: "CUSINV",
        text: "Facture douanière",
        visible: true,
        disabled: false,
      }, // Manque le PBL -> Pas de PBL
      {
        id: "BUYCO",
        text: "Create Shipment (BuyCo)",
        visible: true,
        disabled: false,
      },
      {
        id: "DECBOL",
        text: "Facture douanière BOLLORE",
        visible: true,
        disabled: false,
      },
    ];
    this.plusActionsFlux = this.actionsFlux.slice(
      this.visibleActionsNumber - this.actionsFlux.length
    );
    this.plusActionsFlux.map((flux) => {
      if (flux.disabled === false && flux.visible === true)
        this.plusActionsFluxEnabled = true;
    });
    // if (this.orderConfirmationOnly) this.actionsFlux = this.actionsFlux.filter(flux => flux.id === "ORDRE");
    // console.log(this.orderConfirmationOnly, this.actionsFlux);
  }

  showFluxDoxOtherBtns(e) {
    this.actionSheetTarget = e.element;
    this.actionSheet.visible = !this.actionSheet.visible;

    const syntheseExpeditionsGrid = this.gridsService.get("SyntheseExpeditions", this.gridsService.orderIdentifier(this.ordre)).instance;
    if (syntheseExpeditionsGrid) {
      const detailsExped = syntheseExpeditionsGrid.getDataSource().items();

      if (detailsExped.find(ordreLogisitique => ordreLogisitique.dateDepartReelleFournisseur !== null)) {
        this.actionsFlux
          .find(element => element.id === "PROFOR").disabled = true
      }
    }
  }

  async onClickSendAction(e, annulation?) {
    if (this.gridCommandes) {
      await this.gridsService.waitUntilAllGridDataSaved(this.gridCommandes?.grid);
      this.sendAction(e, annulation);
    } else {
      this.sendAction(e, annulation);
    }
  }

  sendAction(e, annulation?) {
    this.flux = e;

    // On gère le cas des CMR à part, car c'est un fichier à afficher
    if (this.flux === "(CMR)") {
      this.currentCMR = {
        title: "Fiche CMR",
        document: this.ordre.documentCMR,
      };
      this.CMRVisible = true;
      return;
    }

    if (this.flux === "PACKLIST") {
      this.myOrdre = this.ordre;
      this.packingListPopup.visible = true;
      return;
    }

    this.fluxEnvoisService
      .prompt(this.flux, this.ordre.id, this.resultPopup, annulation)
      .pipe(
        tap((res) => {
          // Some order lines can be deleted
          this.gridsService.reload([
            "Commande",
            "SyntheseExpeditions",
            "DetailExpeditions"
          ], this.gridsService.orderIdentifier(this.ordre)
          );
        }),
        filter((res) => res),
        concatMapTo(this.envoisService.countReals(this.ordre.id, this.flux))
      )
      .subscribe((countedReals) => {
        const remplacement = countedReals && this.flux === "ORDRE";
        const popup = remplacement
          ? "remplacePopup"
          : "docsPopup";
        this.docsPopup.annuleOrdre = annulation ?? remplacement;
        this[popup].visible = true;
      });
  }
}
