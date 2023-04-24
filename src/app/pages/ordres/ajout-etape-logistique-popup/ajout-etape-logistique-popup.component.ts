import { Component, EventEmitter, Input, OnChanges, Output, ViewChild } from "@angular/core";
import { LieuxPassageAQuaiService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { TypesTiersService } from "app/shared/services/api/types-tiers.service";
import { DxSelectBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { take } from "rxjs/operators";

@Component({
  selector: "app-ajout-etape-logistique-popup",
  templateUrl: "./ajout-etape-logistique-popup.component.html",
  styleUrls: ["./ajout-etape-logistique-popup.component.scss"]
})
export class AjoutEtapeLogistiquePopupComponent {

  @Input() public lieuxGroupage: string[];
  @Input() public ligneId: string;
  @Output() public afterAjoutOrdlog = new EventEmitter();

  visible: boolean;
  groupageDS: DataSource;
  lieupassageaquaiDS: DataSource;
  dataSource: DataSource;

  @ViewChild("groupageSB", { static: false }) groupageSB: DxSelectBoxComponent;
  @ViewChild("lieuSB", { static: false }) lieuSB: DxSelectBoxComponent;

  constructor(
    private typesTiersService: TypesTiersService,
    private lieupassageaquaiService: LieuxPassageAQuaiService,
    private functionsService: FunctionsService,
  ) { }

  cancelClick() {
    this.visible = false;
  }

  applyClick() {
    this.functionsService
      .fAjoutOrdlog(this.ligneId, this.groupageSB.value.id, this.lieuSB.value.id)
      .valueChanges
      .pipe(take(1))
      .subscribe({
        next: res => this.afterAjoutOrdlog.emit(),
        error: (message: string) => notify({ message }, "error", 7000),
        complete: () => this.visible = false,
      });
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("ajout-etape-logistique-popup");
    this.groupageDS = this.typesTiersService.getDataSource_v2(["id", "description"], 100);
    this.groupageDS.filter([
      ["valide", "=", true],
      "and",
      [["id", "=", "S"],
        "or",
      ["id", "=", "O"],
        "or",
      ["id", "=", "G"]]
    ]);
    this.lieupassageaquaiDS = this.lieupassageaquaiService.getDataSource_v2(["id"]);
    const LPAQfilters = [["valide", "=", true], "and"];
    this.lieuxGroupage.map(lieu => LPAQfilters.push(["id", "=", lieu], "or"));
    LPAQfilters.pop();
    this.lieupassageaquaiDS.filter(LPAQfilters);
    this.lieupassageaquaiDS.load().then(() => {
      if (this.lieuxGroupage.length === 1) {
        this.lieuSB.value = { id: this.lieuxGroupage[0] };
      }
    });
    this.groupageDS.load().then(() => {
      this.groupageSB.value = { id: "G" }; // Seen with Léa 4-04-22: default value
    });
  }

  onHidden() {
    this.clearData();
  }

  clearData() {
    this.lieuSB.value = null;
    this.groupageSB.value = null;
  }

  capitalize(data) {
    return data?.description ? data.description.charAt(0).toUpperCase() + data.description.slice(1).toLowerCase() : null;
  }

}
