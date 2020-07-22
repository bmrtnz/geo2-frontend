import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EntrepotsListComponent } from './list/entrepots-list.component';
import { EntrepotDetailsComponent } from './details/entrepot-details.component';
import { AuthGuardService } from '../../../shared/services';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: EntrepotsListComponent,
    canActivate: [AuthGuardService]
  }, {
    path: ':id',
    component: EntrepotDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: 'create/:client',
    component: EntrepotDetailsComponent,
    canActivate: [AuthGuardService, NestedGuard],
    canDeactivate: [EditingGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EntrepotsRoutingModule { }

