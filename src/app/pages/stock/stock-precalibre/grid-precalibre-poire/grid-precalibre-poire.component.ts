import { Component, Input } from "@angular/core";

@Component({
  selector: "app-grid-precalibre-poire",
  templateUrl: "./grid-precalibre-poire.component.html",
  styleUrls: ["./grid-precalibre-poire.component.scss"],
})
export class GridPrecalibrePoireComponent {
  @Input() public fournisseurId: string;
  @Input() public especeId: string;
  @Input() public varieteId: string;
  @Input() public modeCultureId: string;
}
