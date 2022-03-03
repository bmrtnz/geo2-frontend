import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { NestedGuard } from "app/shared/guards/nested-guard";
import { EntrepotsListComponent } from "../entrepots/list/entrepots-list.component";
import { ClientDetailsComponent } from "./details/client-details.component";
import { ClientsListComponent } from "./list/clients-list.component";

const routes: Routes = [
    {
        path: "",
        redirectTo: "list",
        pathMatch: "full",
    },
    {
        path: "list",
        component: ClientsListComponent,
    },
    {
        path: "create",
        component: ClientDetailsComponent,
        canActivate: [NestedGuard],
        canDeactivate: [EditingGuard],
    },
    {
        path: ":id",
        component: ClientDetailsComponent,
        canActivate: [NestedGuard],
        canDeactivate: [EditingGuard],
    },
    {
        path: ":client/entrepots",
        component: EntrepotsListComponent,
        canActivate: [NestedGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ClientsRoutingModule { }
