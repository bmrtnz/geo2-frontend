import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../../shared/services';
import {LieuxPassageAQuaiListComponent} from './list/lieux-passage-a-quai-list.component';
import {LieuxPassageAQuaiDetailsComponent} from './details/lieux-passage-a-quai-details.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: LieuxPassageAQuaiListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'create',
    component: LieuxPassageAQuaiDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: ':id',
    component: LieuxPassageAQuaiDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard],
    canDeactivate: [EditingGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LieuxPassageAQuaiRoutingModule { }
