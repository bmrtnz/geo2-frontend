
import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { LocalizationService } from "app/shared/services";
import { DxScrollViewComponent } from "devextreme-angular";

@Component({
  selector: "app-zoom-transporteur-popup",
  templateUrl: "./zoom-transporteur-popup.component.html",
  styleUrls: ["./zoom-transporteur-popup.component.scss"]
})

export class ZoomTransporteurPopupComponent implements OnChanges {

  @Input() public transporteurLigneId: string;
  @Input() public transporteurTitle: string;
  @Input() public transporteurId: string;

  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;
  visible: boolean;
  title: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize("zoom-" + (this.transporteurTitle ?? "transporteur"))
      + " "
      + this.transporteurLigneId;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-transporteur-popup");
  }

}


