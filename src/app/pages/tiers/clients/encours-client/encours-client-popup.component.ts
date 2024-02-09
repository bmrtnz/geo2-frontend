import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import Client from "app/shared/models/client.model";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";


@Component({
  selector: "app-encours-client-popup",
  templateUrl: "./encours-client-popup.component.html",
  styleUrls: ["./encours-client-popup.component.scss"],
})
export class EncoursClientPopupComponent implements OnChanges {
  @Input() public client: Partial<Client>;
  @Input() public readOnlyMode: boolean;
  @Input() public comingFrom: string;
  @Output() public clientInfo: any;
  @Output() public popupShown: boolean;
  @Output() openEncoursOrder = new EventEmitter<any>();

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  public visible: boolean;
  public titleStart: string;
  public titleMid: string;
  public popupFullscreen: boolean;

  constructor(
    private router: Router,
  ) {
    this.popupShown = false;
  }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    if (this.client) {
      this.clientInfo = this.client;
      this.titleStart = "En-cours client ";
      this.titleMid = this.clientInfo?.code;
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("encours-client-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.popupShown = true;
  }

  hidePopup() {
    this.popup.visible = false;
    this.popupShown = false;
  }

  openOrder(ordre) {
    if (["detailEncours", "zoomClient"].includes(this.comingFrom))
      this.openEncoursOrder.emit(ordre);
    if (["client"].includes(this.comingFrom)) {
      window.sessionStorage.setItem(
        "openOrder",
        [ordre.numero, ordre.campagne.id].join("|")
      );
      this.hidePopup();
      setTimeout(() => this.router.navigateByUrl("pages/ordres")); // Timeout to let the popup close
    }
  }

}
