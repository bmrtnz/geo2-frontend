import { Component, Input } from "@angular/core";

@Component({
  selector: "app-grid-precalibre-kiwi",
  templateUrl: "./grid-precalibre-kiwi.component.html",
  styleUrls: ["./grid-precalibre-kiwi.component.scss"],
})
export class GridPrecalibreKiwiComponent {
  @Input() public fournisseurId: string;
  @Input() public especeId: string;
  @Input() public varieteId: string;
  @Input() public modeCultureId: string;
}
