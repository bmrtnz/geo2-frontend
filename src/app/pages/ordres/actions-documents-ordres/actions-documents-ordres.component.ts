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
import { catchError, concatMap, concatMapTo, filter, map } from "rxjs/operators";
import { AnnuleRemplacePopupComponent } from "../annule-remplace-popup/annule-remplace-popup.component";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";
import { ConfirmationResultPopupComponent } from "./confirmation-result-popup/confirmation-result-popup.component";

@Component({
  selector: "app-actions-documents-ordres",
  templateUrl: "./actions-documents-ordres.component.html",
  styleUrls: ["./actions-documents-ordres.component.scss"]
})
export class ActionsDocumentsOrdresComponent implements OnInit {

  @Input() public ordre: Ordre;
  @Output() public flux: string;
  @Input() public gridEnvois: GridEnvoisComponent;

  public readonly env = environment;
  public actionsFlux: any[];
  public plusActionsFlux: any[];
  public plusActionsFluxEnabled: boolean;
  public visibleActionsNumber = 6; // Visible buttons number, others in a popup

  @ViewChild("actionSheet", { static: false }) actionSheet: DxActionSheetComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent, { static: false }) docsPopup: DocumentsOrdresPopupComponent;
  @ViewChild(AnnuleRemplacePopupComponent, { static: false }) remplacePopup: AnnuleRemplacePopupComponent;
  @ViewChild(ConfirmationResultPopupComponent) resultPopup: ConfirmationResultPopupComponent;

  constructor(
    private envoisService: EnvoisService,
    private currentCompanyService: CurrentCompanyService,
    private authService: AuthService,
  ) {
    this.actionsFlux = [
      { id: "ORDRE", text: "Confirmation cde", visible: true, disabled: false },
      { id: "DETAIL", text: "Détail expédition", visible: true, disabled: false },
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
    this.plusActionsFlux.map(flux => {
      if (flux.disabled === false && flux.visible === true) this.plusActionsFluxEnabled = true;
    });
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

    const societe: Societe = this.currentCompanyService.getCompany();
    const user = this.authService.currentUser;

    defer(() => {
      if (this.flux === "ORDRE") return this.envoisService
        .fConfirmationCommande(this.ordre.id, societe.id, user.nomUtilisateur);
      if (this.flux === "DETAIL") return this.envoisService
        .fDocumentEnvoiDetailsExp(this.ordre.id, societe.id);
    })
      .pipe(
        map(result => Object.values(result.data)[0]),
        concatMap(response => {
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
        const popup = res.data.countBy && this.flux === "ORDRE" ? "remplacePopup" : "docsPopup";
        this[popup].visible = true;
      });
  }
}
