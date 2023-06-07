import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { StockMainComponent } from "./main/stock-main.component";
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
  DxSelectBoxModule,
  DxDateBoxModule,
  DxValidatorModule,
  DxNumberBoxModule,
} from "devextreme-angular";
import { OrdresModule } from "../ordres/ordres.module";
import { StockPrecalibreComponent } from "./stock-precalibre/stock-precalibre.component";
import { GridPrecalibrePommeComponent } from "./stock-precalibre/grid-precalibre-pomme/grid-precalibre-pomme.component";

@NgModule({
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    StockRoutingModule,
    DxBoxModule,
    DxButtonModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxNumberBoxModule,
    DxValidatorModule,
    DxDataGridModule,
    DxFormModule,
    DxTabPanelModule,
    DxTagBoxModule,
    DxTemplateModule,
    OrdresModule,
  ],
  declarations: [
    StockMainComponent,
    StockPrecalibreComponent,
    GridPrecalibrePommeComponent,
  ],
})
export class StockModule {}
