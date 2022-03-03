import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContactsComponent } from "./contacts/contacts.component";
import { NestedGuard } from "app/shared/guards/nested-guard";

const routes: Routes = [
    {
        path: "clients",
        loadChildren: "./clients/clients.module#ClientsModule",
    },
    {
        path: "fournisseurs",
        loadChildren: "./fournisseurs/fournisseurs.module#FournisseursModule",
    },
    {
        path: "transporteurs",
        loadChildren:
            "./transporteurs/transporteurs.module#TransporteursModule",
    },
    {
        path: "lieux-passage-a-quai",
        loadChildren:
            "./lieux-passage-a-quai/lieux-passage-a-quai.module#LieuxPassageAQuaiModule",
    },
    {
        path: "entrepots",
        loadChildren: "./entrepots/entrepots.module#EntrepotsModule",
    },
    {
        path: "contacts/:codeTiers/:typeTiers",
        component: ContactsComponent,
        canActivate: [NestedGuard],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TiersRoutingModule {}
