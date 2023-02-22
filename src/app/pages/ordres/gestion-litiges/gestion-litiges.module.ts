import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { GridLotComponent } from "./grid-lot/grid-lot.component";
import { DxDataGridModule } from "devextreme-angular";

@NgModule({
  declarations: [GridLotComponent],
  imports: [
    CommonModule,
    DxDataGridModule,
  ],
  exports: [GridLotComponent],
})
export class GestionLitigesModule { }
