import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { DocumentsOrdresPopupComponent } from "../documents-ordres-popup/documents-ordres-popup.component";
import { GridAnnuleRemplaceComponent } from "../grid-annule-remplace/grid-annule-remplace.component";
import { GridEnvoisComponent } from "../grid-envois/grid-envois.component";
import hideToasts from "devextreme/ui/toast/hide_toasts";
import { GridsService } from "../grids.service";

@Component({
  selector: "app-annule-remplace-popup",
  templateUrl: "./annule-remplace-popup.component.html",
  styleUrls: ["./annule-remplace-popup.component.scss"],
})
export class AnnuleRemplacePopupComponent implements OnChanges {
  @Input() public ordre: Ordre;
  @Input() public gridEnvois: GridEnvoisComponent;
  @Input() docsPopup: DocumentsOrdresPopupComponent;

  public visible: boolean;
  public title: string;
  public popupFullscreen: boolean;
  public running: boolean;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(GridAnnuleRemplaceComponent)
  gridAnnuleRemplaceComponent: GridAnnuleRemplaceComponent;

  constructor(
    public localizeService: LocalizationService,
    public gridsService: GridsService,
  ) { }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("annule-et-remplace");
  }
  hidePopup() {
    this.gridAnnuleRemplaceComponent.canBeSent = false;
    this.popup.visible = false;
  }

  onShowing(e) {
    this.running = false;
    e.component.content().parentNode.classList.add("annule-remplace-popup");
  }

  onShown(e) {
    this.gridAnnuleRemplaceComponent.reload();
  }

  clearAndHidePopup() {
    this.hidePopup();
  }

  goDocuments() {
    this.running = true;
    this.gridAnnuleRemplaceComponent.done().subscribe({
      next: async () => {
        this.popup.instance.hide();
        await this.docsPopup.open();
      },
      error: (error: Error) => {
        this.running = false;
        hideToasts();
        console.log(error);
        notify({
          message: error.message.replace("Error :", ""),
          type: "error",
          displayTime: 7000
        },
          { position: 'bottom center', direction: 'up-stack' }
        );
      },
    });
  }
}
