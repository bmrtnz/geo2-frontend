import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {LieuxPassageAQuaiListComponent} from './list/lieux-passage-a-quai-list.component';
import {LieuxPassageAQuaiDetailsComponent} from './details/lieux-passage-a-quai-details.component';

const routes: Routes = [
  {
    path: '',
    component: LieuxPassageAQuaiListComponent,
    canActivate: [AuthGuardService]
  }, {
      path: ':id',
      component: LieuxPassageAQuaiDetailsComponent,
      canActivate: [AuthGuardService]
    }
  ];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LieuxRoutingModule { }
