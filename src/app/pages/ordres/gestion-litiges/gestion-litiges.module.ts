import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CustomCellTemplatesModule } from "app/custom-cell-templates/custom-cell-templates.module";
import { DxDataGridModule } from "devextreme-angular";
import { GridLotComponent } from "./grid-lot/grid-lot.component";

@NgModule({
  declarations: [GridLotComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
    CustomCellTemplatesModule,
  ],
  exports: [GridLotComponent],
})
export class GestionLitigesModule { }
