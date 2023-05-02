import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { LieuxPassageAQuaiDetailsComponent } from "./details/lieux-passage-a-quai-details.component";
import { LieuxPassageAQuaiListComponent } from "./list/lieux-passage-a-quai-list.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "list",
    pathMatch: "full",
  },
  {
    path: "list",
    component: LieuxPassageAQuaiListComponent,
  },
  {
    path: "create",
    component: LieuxPassageAQuaiDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
  {
    path: ":id",
    component: LieuxPassageAQuaiDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LieuxPassageAQuaiRoutingModule {}
