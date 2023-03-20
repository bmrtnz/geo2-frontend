import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MergedDxgridCellTemplateComponent,
  MergeSiblingColumnsPipe,
} from "./merged-dxgrid-cell-template/merged-dxgrid-cell-template.component";
import { DxDataGridModule } from "devextreme-angular";

@NgModule({
  declarations: [MergedDxgridCellTemplateComponent, MergeSiblingColumnsPipe],
  imports: [
    CommonModule,
    DxDataGridModule,
  ],
  exports: [MergedDxgridCellTemplateComponent, MergeSiblingColumnsPipe],
  providers: [MergeSiblingColumnsPipe],
})
export class CustomCellTemplatesModule { }
