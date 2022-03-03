import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "app/shared/shared.module";
import {
    DxButtonModule,
    DxCheckBoxModule,
    DxLoadIndicatorModule,
    DxSelectBoxModule,
    DxTextBoxModule,
    DxValidationGroupModule,
    DxValidatorModule,
} from "devextreme-angular";
import { LoginFormComponent } from "./login-form/login-form.component";
import { ProfileRoutingModule } from "./profile-routing.module";
import { SingleCardModule } from "app/layouts";

@NgModule({
    declarations: [LoginFormComponent],
    imports: [
        ProfileRoutingModule,
        CommonModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        DxButtonModule,
        DxCheckBoxModule,
        DxTextBoxModule,
        DxLoadIndicatorModule,
        DxValidatorModule,
        DxValidationGroupModule,
        DxSelectBoxModule,
        SingleCardModule,
    ],
})
export class ProfileModule {}
