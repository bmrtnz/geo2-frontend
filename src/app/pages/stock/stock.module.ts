import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StockListComponent } from "./list/stock-list.component";
import { SharedModule } from "app/shared/shared.module";
import { StockRoutingModule } from "./stock-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
    DxBoxModule,
    DxButtonModule,
    DxDataGridModule,
    DxTabPanelModule,
    DxTemplateModule,
    DxTagBoxModule,
    DxFormModule,
} from "devextreme-angular";

@NgModule({
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        StockRoutingModule,
        DxBoxModule,
        DxButtonModule,
        DxDataGridModule,
        DxFormModule,
        DxTabPanelModule,
        DxTagBoxModule,
        DxTemplateModule,
    ],
    declarations: [StockListComponent],
})
export class StockModule {}
