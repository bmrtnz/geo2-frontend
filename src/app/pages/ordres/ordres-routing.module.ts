import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../shared/services';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { OrdresIndicateursComponent } from './indicateurs/ordres-indicateurs.component';

const routes: Routes = [
  {
    path: 'accueil',
    component: OrdresAccueilComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'details',
    component: OrdresDetailsComponent,
    canActivate: [AuthGuardService]
  }, {
    path: 'indicateurs',
    component: OrdresIndicateursComponent,
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdresRoutingModule { }
