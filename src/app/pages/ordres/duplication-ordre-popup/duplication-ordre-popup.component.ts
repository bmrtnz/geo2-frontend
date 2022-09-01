import { Component, Input, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import Ordre from "app/shared/models/ordre.model";
import { EntrepotsService, LocalizationService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import { DxPopupComponent, DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-duplication-ordre-popup",
  templateUrl: "./duplication-ordre-popup.component.html",
  styleUrls: ["./duplication-ordre-popup.component.scss"]
})
export class DuplicationOrdrePopupComponent {

  @Input() ordre: Ordre;

  public visible: boolean;
  public itemsToKeep: any[];
  public activateEntrepot: boolean;
  public entrepotDS: DataSource;
  public showModify: boolean;
  public formGroup = new FormGroup({
    dateDepartPrevue: new FormControl(),
    dateLivraisonPrevue: new FormControl(),
    entrepot: new FormControl(),
  });

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxSelectBoxComponent, { static: false }) entrepotSB: DxSelectBoxComponent;

  constructor(
    public dateManagementService: DateManagementService,
    private entrepotsService: EntrepotsService,
    private localization: LocalizationService,
  ) {
    this.itemsToKeep = [
      { name: "codeChargement", checked: true },
      { name: "propExp", checked: true },
      { name: "prixUniteAchat", checked: false },
      { name: "prixUniteVente", checked: false },
      { name: "DLUO", checked: true },
      { name: "ETD", checked: false },
      { name: "ETA", checked: false },
      { name: "portDepart", checked: false },
      { name: "portArrivee", checked: false },
      { name: "incoterm", checked: false },
    ];
    this.itemsToKeep.map(item => this.formGroup.addControl(item.name, new FormControl()));
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("duplication-ordre-popup");
    this.setDefaultValues();
    this.showModify = false;
    if (this.ordre) {
      this.entrepotDS = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
      this.entrepotDS.filter([
        ["valide", "=", true],
        "and",
        ["client.id", "=", this.ordre.client?.id]
      ]);
      // Only show modify button when several entrepôts
      this.entrepotDS.load().then(res => this.showModify = res.length > 1);
    }
  }

  hidePopup() {
    this.popup.visible = false;
  }

  setDefaultValues() {
    this.itemsToKeep.map(item => {
      this.formGroup.get(item.name).patchValue(item.checked);
    });
    this.formGroup.get("dateDepartPrevue").patchValue(this.ordre.dateDepartPrevue);
    this.formGroup.get("dateLivraisonPrevue").patchValue(this.ordre.dateLivraisonPrevue);
    this.formGroup.get("entrepot").patchValue({
      id: this.ordre.entrepot.id,
      code: this.ordre.entrepot.code,
      raisonSocial: this.ordre.entrepot.raisonSocial
    });
    this.activateEntrepot = false;
  }

  displayCodeBefore(data) {
    return data ? data.code + " - " + data.raisonSocial : null;
  }

  changeEntrepot() {
    this.activateEntrepot = true;
  }

  applyClick() {

    const values = this.formGroup.value;
    /////////////////////////////////////////
    // Appel duplique_ordre_on_duplique.pbl
    // avec infos de values
    /////////////////////////////////////////

    const numero = "702222 fake";
    notify(this.localization.localize("ordre-cree").replace("&O", numero), "success", 7000);

    this.hidePopup();
  }

}
