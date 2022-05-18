import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent } from "devextreme-angular";
import { GridLignesHistoriqueComponent } from "../grid-lignes-historique/grid-lignes-historique.component";


@Component({
  selector: "app-historique-modif-detail-popup",
  templateUrl: "./historique-modif-detail-popup.component.html",
  styleUrls: ["./historique-modif-detail-popup.component.scss"]
})

export class HistoriqueModifDetailPopupComponent implements OnChanges {

  @Input() ligneLogistiqueId: string;

  visible: boolean;
  title: string;

  @ViewChild(GridLignesHistoriqueComponent, { static: false }) gridLignesHisto: GridLignesHistoriqueComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  constructor(
    private localizeService: LocalizationService
  ) {
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("title-historique-modif-detail-popup");
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("historique-modif-detail-popup");
  }

  hidePopup() {
    this.popup.visible = false;
  }

}


