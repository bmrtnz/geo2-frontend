import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { environment } from "../environments/environment";
import { ProfileGuard } from "./profile/profile.guard";
import { SharedModule } from "./shared/shared.module";

const routes: Routes = [
  {
    path: "profile",
    loadChildren: () => import("./profile/profile.module").then(m => m.ProfileModule),
  },
  {
    path: "pages",
    loadChildren: () => import("./pages/pages.module").then(m => m.PagesModule),
    canActivateChild: [ProfileGuard],
  },
  {
    path: "**",
    redirectTo: "pages",
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: environment.debugRouting,
      onSameUrlNavigation: "reload",
    }),
    SharedModule,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
