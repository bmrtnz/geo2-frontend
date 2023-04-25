import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { LoginFormComponent } from "./login-form/login-form.component";

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forChild([
      {
        path: "",
        redirectTo: "login",
        pathMatch: "full",
      },
      {
        path: "login",
        component: LoginFormComponent,
      },
      {
        path: "logout",
        redirectTo: "",
      },
    ]),
  ],
})
export class ProfileRoutingModule { }
