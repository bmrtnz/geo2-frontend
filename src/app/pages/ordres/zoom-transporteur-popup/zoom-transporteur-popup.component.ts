
import { Component, Input, OnChanges } from "@angular/core";
import { LocalizationService } from "app/shared/services";

@Component({
  selector: "app-zoom-transporteur-popup",
  templateUrl: "./zoom-transporteur-popup.component.html",
  styleUrls: ["./zoom-transporteur-popup.component.scss"]
})

export class ZoomTransporteurPopupComponent implements OnChanges {

  @Input() public transporteurLigneId: string;
  @Input() public transporteurTitle: string;
  @Input() public transporteurId: string;

  visible: boolean;
  title: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
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


