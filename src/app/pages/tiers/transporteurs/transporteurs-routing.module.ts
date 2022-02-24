import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TransporteursListComponent} from './list/transporteurs-list.component';
import {TransporteurDetailsComponent} from './details/transporteur-details.component';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { EditingGuard } from 'app/shared/guards/editing-guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: TransporteursListComponent,
  }, {
    path: 'create',
    component: TransporteurDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: ':id',
    component: TransporteurDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TransporteursRoutingModule {
}
