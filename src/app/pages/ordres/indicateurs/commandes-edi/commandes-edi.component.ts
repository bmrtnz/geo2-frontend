import { Component, ViewChild } from "@angular/core";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-commandes-edi",
  templateUrl: "./commandes-edi.component.html",
  styleUrls: ["./commandes-edi.component.scss"],
})
export class CommandesEdiComponent {
  public visible: boolean;
  public loadingRecap;

  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;

  constructor() { }

  showHideLoader(e) {
    this.loadingRecap = e;
  }
}

export default CommandesEdiComponent;
