import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { SharedModule } from "app/shared/shared.module";
import {
    DxButtonModule,
    DxDataGridModule,
    DxDrawerModule,
    DxFormModule,
    DxListModule,
} from "devextreme-angular";
import { DisplayDataComponent } from "./exemple/display-data/display-data.component";
import { TestGridFormComponent } from "./exemple/test-grid-form/test-grid-form.component";
import { HomeComponent } from "./home/home.component";
import { PagesRoutingModule } from "./pages-routing.module";
import { PagesComponent } from "./pages.component";
import { FooterModule } from "app/shared/components";
import { SideNavOuterToolbarModule, SingleCardModule } from "../layouts";

@NgModule({
    declarations: [
        PagesComponent,
        HomeComponent,
        DisplayDataComponent,
        TestGridFormComponent,
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
export class PagesModule {}
