import { Component, Input, OnChanges, ViewChild, OnInit, Output, EventEmitter } from "@angular/core";
import { DxPopupComponent, DxListComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import OrdreLogistique from "app/shared/models/ordre-logistique.model";
import { CodifsDevalexpService } from "app/shared/services/api/codifs-devalexp.service";

@Component({
  selector: "app-choix-raison-decloture-popup",
  templateUrl: "./choix-raison-decloture-popup.component.html",
  styleUrls: ["./choix-raison-decloture-popup.component.scss"]
})
export class ChoixRaisonDecloturePopupComponent implements OnInit {

  @Input() public ordreLogistique: OrdreLogistique;
  @Output() public changeLigne = new EventEmitter();

  dataSource: DataSource;
  visible: boolean;
  reason: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxListComponent, { static: false }) codifslist: DxListComponent;

  constructor(
    public codifsDevalexpService: CodifsDevalexpService
  ) { }

  ngOnInit() {
  }

  onShowing(e) {
    this.dataSource = this.codifsDevalexpService.getDataSource_v2(["id", "description"]);
    e.component.content().parentNode.classList.add("choix-raison-decloture-popup");
    this.codifslist.selectedItemKeys = null;
    this.codifslist.instance.repaint();
  }

  onSelectionChanged(e) {
    // Only one item can be selected at once
    if (this.codifslist.selectedItems.length) this.codifslist.selectedItemKeys.shift();
    this.reason = e.addedItems[0]?.id;
  }

  hidePopup() {
    this.popup.visible = false;
  }

  saveModifDetail() {
    // const ordreLigne = { id: this.ordreLigne.id, origineCertification: this.newOrigine ? this.newOrigine : "" };
    // this.OrdreLigneService.save_v2(["id", "origineCertification"], {
    //   ordreLigne,
    // })
    //   .subscribe({
    //     next: () => {
    //       notify(this.localizeService.localize("articles-save-origin"), "success", 2000);
    //       this.changeLigne.emit(null);
    //     },
    //     error: (err) => {
    //       console.log(err);
    //       notify(this.localizeService.localize("articles-save-origin-error"), "error", 2000);
    //     }
    //   });
    this.hidePopup();
  }

  capitalizeDesc(data) {
    return data?.description ? data.description.charAt(0).toUpperCase() + data.description.slice(1).toLowerCase() : null;
  }

}


