import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FooterModule } from "app/shared/components";
import { SharedModule } from "app/shared/shared.module";
import {
  DxButtonModule,
  DxDataGridModule,
  DxDrawerModule,
  DxFormModule,
  DxListModule
} from "devextreme-angular";
import { SideNavOuterToolbarModule, SingleCardModule } from "../layouts";
import { HomeComponent } from "./home/home.component";
import { PagesRoutingModule } from "./pages-routing.module";
import { PagesComponent } from "./pages.component";

@NgModule({
  declarations: [
    PagesComponent,
    HomeComponent,
  ],
  imports: [
    PagesRoutingModule,
    CommonModule,
    SharedModule,
    RouterModule,
    DxDataGridModule,
    DxFormModule,
    DxDrawerModule,
    DxListModule,
    DxButtonModule,
    SideNavOuterToolbarModule,
    SingleCardModule,
    FooterModule,
  ],
})
export class PagesModule { }
