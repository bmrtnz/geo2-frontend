import { Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { EnvoisService } from "app/shared/services/api/envois.service";
import { DxActionSheetComponent, DxPopupComponent } from "devextreme-angular";
import { AnnuleRemplacePopupComponent } from "../annule-remplace-popup/annule-remplace-popup.component";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";

@Component({
  selector: "app-actions-documents-ordres",
  templateUrl: "./actions-documents-ordres.component.html",
  styleUrls: ["./actions-documents-ordres.component.scss"]
})
export class ActionsDocumentsOrdresComponent implements OnInit {

  @Input() public ordre: Ordre;
  @Output() public flux: string;
  @Input() public gridEnvois: GridEnvoisComponent;

  public actionsFlux: any[];
  public plusActionsFlux: any[];
  public visibleActionsNumber = 6; // Visible buttons number, others in a popup

  @ViewChild("actionSheet", { static: false }) actionSheet: DxActionSheetComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent, { static: false }) docsPopup: DocumentsOrdresPopupComponent;
  @ViewChild(AnnuleRemplacePopupComponent, { static: false }) remplacePopup: AnnuleRemplacePopupComponent;

  constructor(
    private envoisService: EnvoisService,
  ) {
    this.actionsFlux = [
      { id: "ORDRE", text: "Confirmation cde", visible: true, disabled: false },
      { id: "DETAIL", text: "Détail expédition", visible: true, disabled: true },
      { id: "MINI", text: "Confirmation px achat", visible: true, disabled: true },
      { id: "FICPAL", text: "Editer fiches palettes", visible: true, disabled: true },
      { id: "? (Générer Traçabilité)", text: "Générer une traçabilité", visible: true, disabled: true },
      { id: "? (Traçabilité)", text: "Traçabilité", visible: true, disabled: true },
      { id: "? (CRM)", text: "Afficher CRM", visible: this.ordre?.fileCMR, disabled: true },
      { id: "? (Résumé ordre)", text: "Résumé de l'ordre", visible: true, disabled: true },
      { id: "BONLIV", text: "Bon de livraison", visible: true, disabled: true },
      { id: "PROFOR", text: "Pro forma", visible: true, disabled: true },
      { id: "customtemplate", text: "Custom template", visible: true, disabled: true },
      { id: "? (Packing list)", text: "Packing list", visible: true, disabled: true },
      { id: "CUSINV", text: "Relevé de factures", visible: true, disabled: true },
      { id: "DECDOU", text: "Facture douanière", visible: true, disabled: true },
      { id: "BUYCO", text: "Create Shipment (BuyCo)", visible: true, disabled: true },
      { id: "DECBOL", text: "Facture douanière BOLLORE", visible: true, disabled: true },
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
    if (this.flux === "ORDRE")
      this.envoisService
        .countByOrdreFluxTraite({ id: this.ordre.id }, { id: this.flux }, "N")
        .subscribe(res => {
          const popup = res.data.countByOrdreFluxTraite ? "remplacePopup" : "docsPopup";
          this[popup].visible = true;
        });
  }
}
