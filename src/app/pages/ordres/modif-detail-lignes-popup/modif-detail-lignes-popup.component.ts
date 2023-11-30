import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from "@angular/core";
import { ArticlesService, AuthService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import notify from "devextreme/ui/notify";
import { PartialObserver } from "rxjs";
import { FluxEnvoisService } from "../../../shared/services/flux-envois.service";
import {
  ConfirmationResultPopupComponent
} from "../../../shared/components/confirmation-result-popup/confirmation-result-popup.component";
import { filter } from "rxjs/operators";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { OrdresService } from "../../../shared/services/api/ordres.service";

@Component({
  selector: "app-modif-detail-lignes-popup",
  templateUrl: "./modif-detail-lignes-popup.component.html",
  styleUrls: ["./modif-detail-lignes-popup.component.scss"],
})
export class ModifDetailLignesPopupComponent {
  @Input() public ligneDetail: any;
  @ViewChild("form") NgForm: any;
  @Output() refreshGrid = new EventEmitter();
  @ViewChild(ConfirmationResultPopupComponent)
  envoisFluxWarningPopup: ConfirmationResultPopupComponent;
  @ViewChild(DocumentsOrdresPopupComponent)
  docsPopup: DocumentsOrdresPopupComponent;

  visible: boolean;
  articleDesc: string;
  validForm: boolean;

  constructor(
    private articlesService: ArticlesService,
    private authService: AuthService,
    public formUtilsService: FormUtilsService,
    private historiqueModificationsDetailService: HistoriqueModificationsDetailService,
    private functionsService: FunctionsService,
    public fluxEnvoisService: FluxEnvoisService,
    public localization: LocalizationService,
    private ordresService: OrdresService,
  ) { }

  public handleCellChangeEventResponse<T>(): PartialObserver<T> {
    return {
      next: (v) => this.refreshGrid.emit(true),
      error: (message: string) => {
        notify({ message }, "error", 7000);
        console.log(message);
      },
    };
  }

  cancelClick() {
    this.visible = false;
  }

  applyClick(form) {
    const ligne = this.ligneDetail;

    const historiqueModificationDetail = {
      ligne: { id: ligne.id },
      ordre: { id: ligne.ordre.id },
      logistique: { id: ligne.logistique.id },
      userModification: this.authService.currentUser.nomUtilisateur,
      nombrePalettesExpedieesAvant: ligne.nombrePalettesExpediees,
      nombreColisExpediesAvant: ligne.nombreColisExpedies,
      poidsBrutExpedieAvant: ligne.poidsBrutExpedie,
      poidsNetExpedieAvant: ligne.poidsNetExpedie,
    };

    // Select only modified qty fields
    Object.keys(form.value).map((val) => {
      if (form.value[val] !== "" && form.value[val] !== null) {
        historiqueModificationDetail[val] = form.value[val];
      }
    });

    this.historiqueModificationsDetailService
      .save_v2(["id"], { historiqueModificationDetail })
      .subscribe({
        next: (res) => {
          notify("Sauvegarde modifications effectuée !", "success", 3000);
          const refHisto = res.data.saveHistoriqueModificationDetail.id;
          this.functionsService
            .fDetailsExpClickModifier(ligne.ordre.id, ligne.id, refHisto)
            .subscribe(this.handleCellChangeEventResponse());
          // open popup Flux DETAIM
          this.handleDetailModif("DETAIM", ligne.ordre.id, this.envoisFluxWarningPopup);
        },
        error: () =>
          notify(
            "Erreur lors de l'enregistrement ddes modifications",
            "error",
            3000
          ),
      });
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("modif-detail-lignes-popup");
    this.articleDesc = this.articlesService.concatArtDescript(
      this.ligneDetail.article
    ).concatDesc;
  }

  onHidden() {
    this.clearData();
    this.validForm = false;
  }

  onValueChanged(e) {
    if (!e.event) return;
    let sum = 0;
    // Detecting null or empty values
    const myInputs = this.NgForm.form.value;
    Object.keys(myInputs).forEach((key) => {
      if (myInputs[key] === "" || myInputs[key] === null) sum++;
    });
    this.validForm = !(sum === Object.keys(myInputs).length);
  }

  clearData() {
    this.NgForm.reset();
  }

  hidePopup() {
    this.visible = false;
  }

  handleDetailModif(flux, ordreId, envoisFluxWarningPopup) {
    let ordreNumero = '';
    this.ordresService.getOne_v2(ordreId, new Set(["numero"])).subscribe({
      next: (res) => {
        ordreNumero = res.data.ordre.numero;
      },
      error: (error: Error) => {
        notify(error.message, "error");
      },
    });

    this.fluxEnvoisService
      .prompt(flux, ordreId, envoisFluxWarningPopup)
      .pipe(filter((res) => res))
      .subscribe(() => {
        this.docsPopup.setTitle();
        this.docsPopup.titleEnd = `${ordreNumero
          } - ${this.localization.localize("tiers-contacts-flux")} ${flux}`;
        this.docsPopup.ordre = this.ligneDetail.ordre;
        this.docsPopup.flux = flux;
        this.docsPopup.visible = true;
        this.hidePopup();
      });
  }
}
