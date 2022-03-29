
import { Component, Input, OnChanges } from "@angular/core";
import { LocalizationService } from "app/shared/services";

@Component({
  selector: "app-zoom-lieupassageaquai-popup",
  templateUrl: "./zoom-lieupassageaquai-popup.component.html",
  styleUrls: ["./zoom-lieupassageaquai-popup.component.scss"]
})

export class ZoomLieupassageaquaiPopupComponent implements OnChanges {

  @Input() public lieupassageaquaiLigneId: string;
  @Input() public lieupassageaquaiTitle: string;

  visible: boolean;
  title: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
  }

  setTitle() {
    this.title = this.localizeService.localize(("zoom-" + (this.lieupassageaquaiTitle ?? "transporteur")))
      + " "
      + this.lieupassageaquaiLigneId;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("zoom-lieupassageaquai-popup");
  }

}


