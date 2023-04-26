import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-client-popup",
  templateUrl: "./zoom-client-popup.component.html",
  styleUrls: ["./zoom-client-popup.component.scss"],
})
export class ZoomClientPopupComponent implements OnChanges {
  @Input() public clientId: string;
  @Input() public clientCode: string;
  @Input() public clientTitle: string;

  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  visible: boolean;
  title: string;

  constructor(private localizeService: LocalizationService) {}

  ngOnChanges() {
    if (!this.clientId) return;
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setTitle();
  }

  setTitle() {
    this.title =
      this.localizeService.localize("zoom-" + (this.clientTitle ?? "client")) +
      " " +
      this.clientCode;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-client-popup");
  }
}
