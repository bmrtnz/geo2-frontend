import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../shared/services';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { BonAFacturerComponent } from './indicateurs/bon-a-facturer/bon-a-facturer.component';
import { LitigesComponent } from './indicateurs/litiges/litiges.component';
import { OrdresIndicateursComponent } from './indicateurs/ordres-indicateurs.component';
import { OrdresNonCloturesComponent } from './indicateurs/ordres-non-clotures/ordres-non-clotures/ordres-non-clotures.component';
import { SupervisionLivraisonComponent } from './indicateurs/supervision-livraison/supervision-livraison/supervision-livraison.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'accueil'
  },
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
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/litiges',
    component: LitigesComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/bonAFacturer',
    component: BonAFacturerComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/supervisionLivraison',
    component: SupervisionLivraisonComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/ordresNonClotures',
    component: OrdresNonCloturesComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdresRoutingModule { }
