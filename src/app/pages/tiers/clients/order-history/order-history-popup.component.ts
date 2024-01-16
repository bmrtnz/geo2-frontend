import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import Client from "app/shared/models/client.model";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-order-history-popup",
  templateUrl: "./order-history-popup.component.html",
  styleUrls: ["./order-history-popup.component.scss"],
})
export class OrderHistoryPopupComponent implements OnChanges {
  @Input() public client: Client;
  @Input() public readOnlyMode: boolean;
  @Input() public comingFrom: string;
  @Output() public gridSelectionEnabled: boolean;
  @Output() public clientId: string;
  @Output() public entrepotId: string;
  @Output() public secteurId: string;
  @Output() public popupShown: boolean;
  @Output() public isComingFrom: string;
  @Output() orderOpen = new EventEmitter<any>();

  public visible: boolean;
  public titleStart: string;
  public titleMid: string;
  public popupFullscreen: boolean;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  constructor() { }

  ngOnChanges() {
    this.setTitle();
    this.isComingFrom = this.comingFrom;
    this.gridSelectionEnabled = !this.readOnlyMode;
  }

  setTitle() {
    if (this.client?.id) {
      this.clientId = this.client.id;
      this.secteurId = this.client.secteur.id;
      this.titleStart = "Historique client ";
      this.titleMid = this.client.raisonSocial;
    }
  }

  clientChanged(e) {
    this.titleMid = e?.raisonSocial ?? "";
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("order-histo-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.popupShown = true;
  }

  hidePopup() {
    this.popup.visible = false;
    this.popupShown = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

  openOrder(ordre) {
    this.orderOpen.emit(ordre);
  }


}
