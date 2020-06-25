import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClientDetailsComponent} from './details/client-details.component';
import { ClientsListComponent } from './list/clients-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/nested/clients',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ClientsListComponent,
  },
  {
    path: ':id',
    component: ClientDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {
}
