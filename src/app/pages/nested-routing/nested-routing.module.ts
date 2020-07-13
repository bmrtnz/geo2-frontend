import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NestedComponent } from '../nested/nested.component';
import { ClientsListComponent } from '../tiers/clients/list/clients-list.component';
import { ClientDetailsComponent } from '../tiers/clients/details/client-details.component';
import { FournisseursListComponent } from '../tiers/fournisseurs/list/fournisseurs-list.component';
import { FournisseurDetailsComponent } from '../tiers/fournisseurs/details/fournisseur-details.component';
import { TransporteursListComponent } from '../tiers/transporteurs/list/transporteurs-list.component';
import { TransporteurDetailsComponent } from '../tiers/transporteurs/details/transporteur-details.component';
import { LieuxPassageAQuaiListComponent } from '../tiers/lieux-passage-a-quai/list/lieux-passage-a-quai-list.component';
import { LieuxPassageAQuaiDetailsComponent } from '../tiers/lieux-passage-a-quai/details/lieux-passage-a-quai-details.component';
import { ArticlesListComponent } from '../articles/list/articles-list.component';
import { ArticleDetailsComponent } from '../articles/details/article-details.component';
import { ContactsComponent } from '../tiers/contacts/contacts.component';
import { EntrepotsListComponent } from '../tiers/entrepots/list/entrepots-list.component';

// Outlets issue :
// https://github.com/angular/angular/issues/18271
const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'clients',
    component: NestedComponent,
    children: [
      {
        path: '',
        component: ClientsListComponent,
      },
      {
        path: ':id',
        component: ClientDetailsComponent,
        outlet: 'details',
      },
      {
        path: 'contacts/:codeTiers/:typeTiers',
        component: ContactsComponent,
        outlet: 'details',
      },
      {
        path: ':client/entrepots',
        component: EntrepotsListComponent,
        outlet: 'details',
      },
    ],
  },
  {
    path: 'fournisseurs',
    component: NestedComponent,
    children: [
      {
        path: '',
        component: FournisseursListComponent,
      },
      {
        path: ':id',
        component: FournisseurDetailsComponent,
        outlet: 'details',
      },
      {
        path: 'contacts/:codeTiers/:typeTiers',
        component: ContactsComponent,
        outlet: 'details',
      },
    ],
  },
  {
    path: 'transporteurs',
    component: NestedComponent,
    children: [
      {
        path: '',
        component: TransporteursListComponent,
      },
      {
        path: ':id',
        component: TransporteurDetailsComponent,
        outlet: 'details',
      },
      {
        path: 'contacts/:codeTiers/:typeTiers',
        component: ContactsComponent,
        outlet: 'details',
      },
    ],
  },
  {
    path: 'lieuxpassageaquai',
    component: NestedComponent,
    children: [
      {
        path: '',
        component: LieuxPassageAQuaiListComponent,
      },
      {
        path: ':id',
        component: LieuxPassageAQuaiDetailsComponent,
        outlet: 'details',
      },
      {
        path: 'contacts/:codeTiers/:typeTiers',
        component: ContactsComponent,
        outlet: 'details',
      },
    ],
  },
  {
    path: 'articles',
    component: NestedComponent,
    children: [
      {
        path: '',
        component: ArticlesListComponent,
      },
      {
        path: ':id',
        component: ArticleDetailsComponent,
        outlet: 'details',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NestedRoutingModule { }
