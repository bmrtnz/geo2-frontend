import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClientDetailsComponent} from './details/client-details.component';
import { ClientsListComponent } from './list/clients-list.component';
import { AuthGuardService } from 'app/shared/services';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/nested/clients',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ClientsListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'create',
    component: ClientDetailsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: ClientDetailsComponent,
    canActivate: [AuthGuardService]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {
}
