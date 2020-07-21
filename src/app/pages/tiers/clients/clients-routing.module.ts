import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClientDetailsComponent} from './details/client-details.component';
import { ClientsListComponent } from './list/clients-list.component';
import { AuthGuardService } from 'app/shared/services';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EntrepotsListComponent } from '../entrepots/list/entrepots-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
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
    canActivate: [AuthGuardService, NestedGuard]
  }, {
    path: ':client/entrepots',
    component: EntrepotsListComponent,
    canActivate: [AuthGuardService, NestedGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {
}
