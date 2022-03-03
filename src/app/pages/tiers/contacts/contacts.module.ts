import { NgModule } from "@angular/core";
import { SharedModule } from "../../../shared/shared.module";
import { ContactsComponent } from "./contacts.component";
import {
    DxAccordionModule,
    DxBoxModule,
    DxButtonModule,
    DxCheckBoxModule,
    DxDataGridModule,
    DxFormModule,
    DxListModule,
    DxNumberBoxModule,
    DxPopoverModule,
    DxSelectBoxModule,
    DxTextAreaModule,
    DxTextBoxModule,
    DxValidatorModule,
} from "devextreme-angular";

@NgModule({
    imports: [
        SharedModule,
        DxAccordionModule,
        DxBoxModule,
        DxButtonModule,
        DxCheckBoxModule,
        DxDataGridModule,
        DxFormModule,
        DxListModule,
        DxNumberBoxModule,
        DxPopoverModule,
        DxSelectBoxModule,
        DxTextAreaModule,
        DxTextBoxModule,
        DxValidatorModule,
    ],
    declarations: [ContactsComponent],
})
export class ContactsModule {}
