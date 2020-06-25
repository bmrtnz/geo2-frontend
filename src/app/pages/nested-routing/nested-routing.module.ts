import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NestedComponent } from '../nested/nested.component';
import { ClientsListComponent } from '../tiers/clients/list/clients-list.component';
import { ClientDetailsComponent } from '../tiers/clients/details/client-details.component';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NestedRoutingModule { }
