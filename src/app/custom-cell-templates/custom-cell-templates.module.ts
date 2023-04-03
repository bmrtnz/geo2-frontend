import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { LocalizePipe } from "app/shared/pipes";
import { DxButtonModule, DxDataGridModule, DxTextBoxModule } from "devextreme-angular";
import { SharedModule } from "../shared/shared.module";
import {
  CopyFillHeaderCellTemplateComponent
} from "./copy-fill-header-cell-template/copy-fill-header-cell-template.component";
import {
  MergedDxgridCellTemplateComponent,

  MergeEditSiblingColumnsPipe, MergeSiblingColumnsPipe
} from "./merged-dxgrid-cell-template/merged-dxgrid-cell-template.component";

@NgModule({
  declarations: [
    MergedDxgridCellTemplateComponent,
    MergeSiblingColumnsPipe,
    MergeEditSiblingColumnsPipe,
    CopyFillHeaderCellTemplateComponent,
  ],
  exports: [
    MergedDxgridCellTemplateComponent,
    MergeSiblingColumnsPipe,
    MergeEditSiblingColumnsPipe,
    CopyFillHeaderCellTemplateComponent,
  ],
  providers: [
    LocalizePipe,
    MergeSiblingColumnsPipe,
  ],
  imports: [
    CommonModule,
    DxDataGridModule,
    DxTextBoxModule,
    DxButtonModule,
    SharedModule
  ]
})
export class CustomCellTemplatesModule { }
