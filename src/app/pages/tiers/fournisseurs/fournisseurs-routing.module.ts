import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {FournisseursListComponent} from './list/fournisseurs-list.component';
import {FournisseurDetailsComponent} from './details/fournisseur-details.component';

const routes: Routes = [
  {
    path: '',
    component: FournisseursListComponent,
    canActivate: [AuthGuardService]
  }, {
      path: ':id',
      component: FournisseurDetailsComponent,
      canActivate: [AuthGuardService]
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
