import { Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { DxActionSheetComponent, DxPopupComponent } from "devextreme-angular";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";

@Component({
  selector: "app-actions-documents-ordres",
  templateUrl: "./actions-documents-ordres.component.html",
  styleUrls: ["./actions-documents-ordres.component.scss"]
})
export class ActionsDocumentsOrdresComponent implements OnInit {

  @Input() public ordre: Ordre;
  @Output() public flux: string;

  public actionsFlux: any[];
  public plusActionsFlux: any[];
  public visibleActionsNumber = 6; // Visible buttons number, others in a popup

  @ViewChild("actionSheet", { static: false }) actionSheet: DxActionSheetComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent, { static: false }) docsPopup: DocumentsOrdresPopupComponent;

  constructor() {
    this.actionsFlux = [
      { id: "ORDRE", text: "Confirmation cde", visible: true },
      { id: "DETAIL", text: "Détail expédition", visible: true },
      { id: "MINI", text: "Confirmation px achat", visible: true },
      { id: "FICPAL", text: "Editer fiches palettes", visible: true },
      { id: "? (Générer Traçabilité)", text: "Générer une traçabilité", visible: true },
      { id: "? (Traçabilité)", text: "Traçabilité", visible: true },
      { id: "? (CRM)", text: "Afficher CRM", visible: this.ordre?.fileCMR },
      { id: "? (Résumé ordre)", text: "Résumé de l'ordre", visible: true },
      { id: "BONLIV", text: "Bon de livraison", visible: true },
      { id: "PROFOR", text: "Pro forma", visible: true },
      { id: "customtemplate", text: "Custom template", visible: true },
      { id: "? (Packing list)", text: "Packing list", visible: true },
      { id: "CUSINV", text: "Relevé de factures", visible: true },
      { id: "DECDOU", text: "Facture douanière", visible: true },
      { id: "BUYCO", text: "Create Shipment (BuyCo)", visible: true },
      { id: "DECBOL", text: "Facture douanière BOLLORE", visible: true }
    ];
    this.plusActionsFlux = this.actionsFlux.slice(this.visibleActionsNumber - this.actionsFlux.length);
  }

  ngOnInit(): void {
  }

  showFluxDoxOtherBtns(e) {
    if (this.actionSheet.visible) {
      this.actionSheet.instance.hide();
    } else {
      this.actionSheet.visible = true;
      this.actionSheet.instance.show();
    }
  }
  sendAction(e) {
    // On récupère ici le code de l'action:
    this.flux = e;
    this.docsPopup.visible = true;
  }
}
