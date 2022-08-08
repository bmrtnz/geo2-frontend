import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { EntrepotDetailsComponent } from "./details/entrepot-details.component";
import { EntrepotsListComponent } from "./list/entrepots-list.component";
import { SetBassinComponent } from "./set-bassin/set-bassin.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "list",
    pathMatch: "full",
  },
  {
    path: "list",
    component: EntrepotsListComponent,
  },
  {
    path: ":id",
    component: EntrepotDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
  {
    path: ":id/bassin",
    component: SetBassinComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
  {
    path: "create/:client",
    component: EntrepotDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EntrepotsRoutingModule { }
