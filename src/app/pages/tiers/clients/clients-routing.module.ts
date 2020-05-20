import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {ClientDetailsComponent} from './details/client-details.component';
import {ContactsComponent} from '../contacts/contacts.component';

const routes: Routes = [
  {
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
