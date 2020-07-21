import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {TransporteursListComponent} from './list/transporteurs-list.component';
import {TransporteurDetailsComponent} from './details/transporteur-details.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: TransporteursListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'create',
    component: TransporteurDetailsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: TransporteurDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransporteursRoutingModule {
}
