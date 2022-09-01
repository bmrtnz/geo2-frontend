import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import Ordre from "app/shared/models/ordre.model";
import { EntrepotsService } from "app/shared/services";
import { DateManagementService } from "app/shared/services/date-management.service";
import { DxPopupComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: "app-duplication-ordre-popup",
  templateUrl: "./duplication-ordre-popup.component.html",
  styleUrls: ["./duplication-ordre-popup.component.scss"]
})
export class DuplicationOrdrePopupComponent implements OnChanges {

  @Input() ordre: Ordre;

  public visible: boolean;
  public itemsToKeep: any[];
  public activateEntrepot: boolean;
  public entrepotDS: DataSource;
  public formGroup = new FormGroup({
    dateDepartPrevue: new FormControl(),
    dateLivraisonPrevue: new FormControl(),
    entrepot: new FormControl(),
  });

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  constructor(
    public dateManagementService: DateManagementService,
    private entrepotsService: EntrepotsService,
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

  ngOnChanges() {

    this.entrepotDS = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
    if (this.ordre) {
      this.entrepotDS.filter([
        ["valide", "=", true],
        "and",
        ["client.id", "=", this.ordre.client?.id]
      ]);
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("duplication-ordre-popup");
    this.setDefaultValues();
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
    this.formGroup.get("entrepot").patchValue({ id: this.ordre.entrepot.id });
    this.activateEntrepot = false;
  }

  displayCodeBefore(data) {
    return data ? data.code + " - " + data.raisonSocial : null;
  }

  changeEntrepot() {
    this.activateEntrepot = true;
  }

  applyClick() {
    this.hidePopup();
  }

}
