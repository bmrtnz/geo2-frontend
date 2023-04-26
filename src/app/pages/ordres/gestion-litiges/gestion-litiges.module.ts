import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { DxDataGridModule } from "devextreme-angular";
import {
  GridLotComponent,
  MergeSiblingColumnsPipe,
} from "./grid-lot/grid-lot.component";

@NgModule({
  declarations: [GridLotComponent, MergeSiblingColumnsPipe],
  imports: [CommonModule, DxDataGridModule],
  exports: [GridLotComponent],
  providers: [MergeSiblingColumnsPipe],
})
export class GestionLitigesModule {}
