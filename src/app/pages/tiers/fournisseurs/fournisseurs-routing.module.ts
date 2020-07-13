import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {FournisseursListComponent} from './list/fournisseurs-list.component';
import {FournisseurDetailsComponent} from './details/fournisseur-details.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/nested/fournisseurs',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: FournisseursListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: FournisseurDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard]
  }, {
    path: 'create',
    component: FournisseurDetailsComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FournisseursRoutingModule { }
