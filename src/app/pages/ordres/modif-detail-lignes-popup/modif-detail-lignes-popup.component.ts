import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { HistoriqueModificationDetail } from "app/shared/models";
import OrdreLigne from "app/shared/models/ordre-ligne.model";
import { ArticlesService, AuthService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import notify from "devextreme/ui/notify";
import { PartialObserver } from "rxjs";

@Component({
  selector: "app-modif-detail-lignes-popup",
  templateUrl: "./modif-detail-lignes-popup.component.html",
  styleUrls: ["./modif-detail-lignes-popup.component.scss"]
})
export class ModifDetailLignesPopupComponent {


  @Input() public ligneDetail: any;
  @ViewChild("form") NgForm: any;
  @Output() refreshGrid = new EventEmitter();

  visible: boolean;
  articleDesc: string;
  validForm: boolean;

  constructor(
    private articlesService: ArticlesService,
    private authService: AuthService,
    public formUtilsService: FormUtilsService,
    private historiqueModificationsDetailService: HistoriqueModificationsDetailService,
    private functionsService: FunctionsService
  ) { }

  public handleCellChangeEventResponse<T>(): PartialObserver<T> {
    return {
      next: v => this.refreshGrid.emit(true),
      error: (message: string) => {
        notify({ message }, "error", 7000);
        console.log(message);
      }
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
      poidsNetExpedieAvant: ligne.poidsNetExpedie
    };

    // Select only modified qty fields
    Object.keys(form.value).map(val => {
      if (form.value[val] !== "" && form.value[val] !== null) {
        historiqueModificationDetail[val] = form.value[val];
      }
    });


    this.historiqueModificationsDetailService.save_v2(["id"], { historiqueModificationDetail }).subscribe({
      next: (res) => {
        notify("Sauvegarde modifications effectuée !", "success", 3000);
        const refHisto = res.data.saveHistoriqueModificationDetail.id;
        this.functionsService.fDetailsExpClickModifier(ligne.ordre.id, ligne.id, refHisto).subscribe(this.handleCellChangeEventResponse());
        this.hidePopup();
      },
      error: () => notify("Erreur lors de l'enregistrement ddes modifications", "error", 3000)
    });

  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("modif-detail-lignes-popup");
    this.articleDesc = this.articlesService.concatArtDescript(this.ligneDetail.article).concatDesc;
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
    Object.keys(myInputs).forEach(key => {
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

}
