import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {ClientDetailsComponent} from './details/client-details.component';
import {ClientsListComponent} from './list/clients-list.component';

const routes: Routes = [
  {
    path: '',
    component: ClientsListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: ClientDetailsComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClientsRoutingModule {
}
