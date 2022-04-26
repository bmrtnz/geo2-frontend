import { Component, Input, OnChanges, OnInit, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";
import { confirm } from "devextreme/ui/dialog";
import { GridChoixEnvoisComponent } from "../grid-choix-envois/grid-choix-envois.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";

@Component({
  selector: "app-documents-ordres-popup",
  templateUrl: "./documents-ordres-popup.component.html",
  styleUrls: ["./documents-ordres-popup.component.scss"]
})
export class DocumentsOrdresPopupComponent implements OnInit, OnChanges {

  @Input() public ordre: Ordre;
  @Input() public flux: string;
  @Input() public gridEnvois: GridEnvoisComponent;

  visible: boolean;
  titleStart: string;
  titleEnd: string;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridChoixEnvoisComponent) gridChoixEnvoisComponent: GridChoixEnvoisComponent;

  constructor(
    public localizeService: LocalizationService
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("documents-ordres");
    if (!this.ordre) return;
    this.titleEnd = this.ordre.numero + " - "
      + this.localizeService.localize("tiers-contacts-flux")
      + " "
      + this.flux;
  }
  hidePopup() {

    const result = confirm(this.localizeService.localize("text-popup-annuler-envoi-docs"), "Génération des envois");
    result.then((quit) => {
      if (quit) this.popup.visible = false;
    });
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("documents-ordres-popup");
  }

  onShown(e) {
    this.gridChoixEnvoisComponent.reload();
  }

  clearAndHidePopup() {
    this.hidePopup();
  }

  goDocuments() {
    this.gridChoixEnvoisComponent.done()
      .subscribe({
        complete: () => (this.popup.instance.hide(), this.gridEnvois.reload()),
      });
  }

}
