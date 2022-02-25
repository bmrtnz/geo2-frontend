import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ClientDetailsComponent} from './details/client-details.component';
import { ClientsListComponent } from './list/clients-list.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EntrepotsListComponent } from '../entrepots/list/entrepots-list.component';
import { EditingGuard } from 'app/shared/guards/editing-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  },
  {
    path: 'list',
    component: ClientsListComponent,
  }, {
    path: 'create',
    component: ClientDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: ':id',
    component: ClientDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: ':client/entrepots',
    component: EntrepotsListComponent,
    canActivate: [NestedGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {
}
