import {
  Component,
  Input,
  NgModule,
  OnChanges,
  ViewChild,
} from "@angular/core";
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupModule,
} from "devextreme-angular";
import { SharedModule } from "../../shared.module";
import { Historique } from "../../models";
import dxDataGrid from "devextreme/ui/data_grid";

@Component({
  selector: "app-historique-valide",
  templateUrl: "./historique-valide.component.html",
  styleUrls: ["./historique-valide.component.scss"],
})
export class HistoriqueValideComponent implements OnChanges {
  @Input() historique: Historique[];
  btnVisible = false;
  visible = false;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  constructor() { }

  ngOnChanges() {
    if (this.historique) {
      this.btnVisible = this.historique.length > 0;
    }
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("histo-change-tiers-popup");
  }

  sortGrid() {
    this.dataGrid.instance.columnOption("dateModification", {
      sortOrder: "desc",
    });
  }
}

@NgModule({
  declarations: [HistoriqueValideComponent],
  imports: [DxButtonModule, DxPopupModule, DxDataGridModule, SharedModule],
  exports: [HistoriqueValideComponent],
})
export class HistoriqueValideModule { }
