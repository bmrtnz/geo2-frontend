import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { ContactsComponent } from "./contacts/contacts.component";
import { NestedGuard } from "app/shared/guards/nested-guard";

const routes: Routes = [
  {
    path: "clients",
    loadChildren: () =>
      import("./clients/clients.module").then((m) => m.ClientsModule),
  },
  {
    path: "fournisseurs",
    loadChildren: () =>
      import("./fournisseurs/fournisseurs.module").then(
        (m) => m.FournisseursModule
      ),
  },
  {
    path: "transporteurs",
    loadChildren: () =>
      import("./transporteurs/transporteurs.module").then(
        (m) => m.TransporteursModule
      ),
  },
  {
    path: "lieux-passage-a-quai",
    loadChildren: () =>
      import("./lieux-passage-a-quai/lieux-passage-a-quai.module").then(
        (m) => m.LieuxPassageAQuaiModule
      ),
  },
  {
    path: "entrepots",
    loadChildren: () =>
      import("./entrepots/entrepots.module").then((m) => m.EntrepotsModule),
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
