import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import Ordre from "app/shared/models/ordre.model";
import { LitigeCausesService } from "app/shared/services/api/litige-causes.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { DxCheckBoxComponent, DxListComponent, DxPopupComponent, DxRadioGroupComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";

@Component({
  selector: "app-duplication-ordre-popup",
  templateUrl: "./duplication-ordre-popup.component.html",
  styleUrls: ["./duplication-ordre-popup.component.scss"]
})
export class DuplicationOrdrePopupComponent {

  @Input() ordre: Ordre;

  public visible: boolean;
  public itemsToKeep: any[];
  public formGroup = new FormGroup({
    dateDepartPrevue: new FormControl(),
    dateLivraisonPrevue: new FormControl()
  });

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  constructor(
    public dateManagementService: DateManagementService
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
    this.formGroup.get("dateDepartPrevue").patchValue(this.ordre.dateDepartPrevue);
    this.formGroup.get("dateLivraisonPrevue").patchValue(this.ordre.dateLivraisonPrevue);
  }

  onHiding() {
    console.log(this.formGroup);
  }

  hidePopup() {
    this.popup.visible = false;
  }

  setDefaultValues() {
    this.itemsToKeep.map(item => {
      this.formGroup.get(item.name).patchValue(item.checked);
    });
  }

  applyClick() {
    this.hidePopup();
  }

}
