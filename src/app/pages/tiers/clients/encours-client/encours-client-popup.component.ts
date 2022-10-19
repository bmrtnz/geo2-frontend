import { Component, Input, OnChanges, Output, ViewChild } from "@angular/core";
import Client from "app/shared/models/client.model";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-encours-client-popup",
  templateUrl: "./encours-client-popup.component.html",
  styleUrls: ["./encours-client-popup.component.scss"]
})
export class EncoursClientPopupComponent implements OnChanges {

  @Input() public client: Client;
  @Input() public readOnlyMode: boolean;
  @Output() public clientId: string;
  @Output() public entrepotId: string;
  @Output() public secteurId: string;
  @Output() public popupShown: boolean;

  visible: boolean;
  titleStart: string;
  titleMid: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor() {
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    if (this.client) {
      this.clientId = this.client.id;
      this.secteurId = this.client.secteur.id;
      this.titleStart = "En-cours client ";
      this.titleMid = this.client.raisonSocial;
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("encours-client-popup");
    this.popupShown = true;
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
  }

  hidePopup() {
    this.popup.visible = false;
    this.popupShown = false;
  }

}


