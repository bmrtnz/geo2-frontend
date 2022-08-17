import { Component, EventEmitter, Input, OnChanges, Output } from "@angular/core";


@Component({
  selector: "app-modif-commande-edi-popup",
  templateUrl: "./modif-commande-edi-popup.component.html",
  styleUrls: ["./modif-commande-edi-popup.component.scss"]
})
export class ModifCommandeEdiPopupComponent implements OnChanges {

  @Input() public commandeEDIId: string;
  @Output() public ordreEdiId: string;
  @Output() gridTitle = "";

  visible: boolean;

  constructor(
  ) { }

  ngOnChanges() {
    this.ordreEdiId = this.commandeEDIId;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("modif-commande-edi-popup");
  }

}
