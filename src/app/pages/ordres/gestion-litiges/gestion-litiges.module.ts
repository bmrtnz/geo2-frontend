import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CustomCellTemplatesModule } from "app/custom-cell-templates/custom-cell-templates.module";
import { ChooseEntrepotPopupModule } from "app/shared/components/choose-entrepot-popup/choose-entrepot-popup.component";
import { DxDataGridModule } from "devextreme-angular";
import { GridLotComponent } from "./grid-lot/grid-lot.component";

@NgModule({
  declarations: [GridLotComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    CustomCellTemplatesModule,
    ChooseEntrepotPopupModule,
  ],
  exports: [GridLotComponent],
})
export class GestionLitigesModule { }
