import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EditingGuard } from "app/shared/guards/editing-guard";
import { ArticleDetailsComponent } from "../articles/details/article-details.component";
import { ArticlesListComponent } from "../articles/list/articles-list.component";
import { ClientDetailsComponent } from "../tiers/clients/details/client-details.component";
import { ClientsListComponent } from "../tiers/clients/list/clients-list.component";
import { ContactsComponent } from "../tiers/contacts/contacts.component";
import { EntrepotDetailsComponent } from "../tiers/entrepots/details/entrepot-details.component";
import { EntrepotsListComponent } from "../tiers/entrepots/list/entrepots-list.component";
import { FournisseurDetailsComponent } from "../tiers/fournisseurs/details/fournisseur-details.component";
import { FournisseursListComponent } from "../tiers/fournisseurs/list/fournisseurs-list.component";
import { LieuxPassageAQuaiDetailsComponent } from "../tiers/lieux-passage-a-quai/details/lieux-passage-a-quai-details.component";
import { LieuxPassageAQuaiListComponent } from "../tiers/lieux-passage-a-quai/list/lieux-passage-a-quai-list.component";
import { TransporteurDetailsComponent } from "../tiers/transporteurs/details/transporteur-details.component";
import { TransporteursListComponent } from "../tiers/transporteurs/list/transporteurs-list.component";
import { NestedComponent } from "./nested.component";

// Outlets issues :
// https://github.com/angular/angular/issues/18271
// https://github.com/angular/angular/issues/10726
// OUTLETS + LAZY MODULES NOT WORKING ¯\_(ツ)_/¯
// Duplicating routes instead of modules inclusion
const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "n",
    component: NestedComponent,
    // canActivateChild: [AuthGuardService],
    children: [
      {
        path: "tiers/clients/list",
        component: ClientsListComponent,
      },
      {
        path: "tiers/clients/create",
        component: ClientDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/clients/:id",
        component: ClientDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/clients/:client/entrepots",
        component: EntrepotsListComponent,
      },
      {
        path: "tiers/clients/:client/entrepots/list",
        component: EntrepotsListComponent,
      },
      {
        path: "tiers/clients/:client/entrepots/:id",
        component: EntrepotDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/fournisseurs/list",
        component: FournisseursListComponent,
      },
      {
        path: "tiers/fournisseurs/create",
        component: FournisseurDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/fournisseurs/:id",
        component: FournisseurDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/fournisseurs/:client/entrepots",
        component: FournisseursListComponent,
        outlet: "details",
      },
      {
        path: "tiers/transporteurs/list",
        component: TransporteursListComponent,
      },
      {
        path: "tiers/transporteurs/create",
        component: TransporteurDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/transporteurs/:id",
        component: TransporteurDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/lieux-passage-a-quai/list",
        component: LieuxPassageAQuaiListComponent,
      },
      {
        path: "tiers/lieux-passage-a-quai/create",
        component: LieuxPassageAQuaiDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/lieux-passage-a-quai/:id",
        component: LieuxPassageAQuaiDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/entrepots/list",
        component: EntrepotsListComponent,
      },
      {
        path: "tiers/entrepots/create/:client",
        component: EntrepotDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/entrepots/:id",
        component: EntrepotDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "tiers/contacts/:codeTiers/:typeTiers",
        component: ContactsComponent,
        outlet: "details",
      },
      {
        path: "articles/list",
        component: ArticlesListComponent,
      },
      {
        path: "articles/create",
        component: ArticleDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
      {
        path: "articles/:id",
        component: ArticleDetailsComponent,
        outlet: "details",
        canDeactivate: [EditingGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NestedRoutingModule {}
