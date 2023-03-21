import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  MergedDxgridCellTemplateComponent,
  MergeSiblingColumnsPipe,
  MergeEditSiblingColumnsPipe,
} from "./merged-dxgrid-cell-template/merged-dxgrid-cell-template.component";
import { DxDataGridModule, DxTextBoxModule } from "devextreme-angular";

@NgModule({
  declarations: [
    MergedDxgridCellTemplateComponent,
    MergeSiblingColumnsPipe,
    MergeEditSiblingColumnsPipe,
  ],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxTextBoxModule,
  ],
  exports: [
    MergedDxgridCellTemplateComponent,
    MergeSiblingColumnsPipe,
    MergeEditSiblingColumnsPipe,
  ],
  providers: [MergeSiblingColumnsPipe],
})
export class CustomCellTemplatesModule { }
