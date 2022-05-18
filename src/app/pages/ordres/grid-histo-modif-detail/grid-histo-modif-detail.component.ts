import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-grid-histo-modif-detail",
  templateUrl: "./grid-histo-modif-detail.component.html",
  styleUrls: ["./grid-histo-modif-detail.component.scss"]
})
export class GridHistoModifDetailComponent implements OnInit {

  @Input() ligneLogistiqueId: string;

  constructor() { }

  ngOnInit(): void {
  }

}
