import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuardService} from '../../shared/services';
import { OrdresAccueilComponent } from './accueil/ordres-accueil.component';
import { OrdresDetailsComponent } from './details/ordres-details.component';
import { BonAFacturerComponent } from './indicateurs/bon-a-facturer/bon-a-facturer.component';
import { ClientsDepEncoursComponent } from './indicateurs/clients-dep-encours/clients-dep-encours.component';
import { CommandesTransitComponent } from './indicateurs/commandes-transit/commandes-transit.component';
import { LitigesComponent } from './indicateurs/litiges/litiges.component';
import { OrdresNonCloturesComponent } from './indicateurs/ordres-non-clotures/ordres-non-clotures.component';
import { OrdresNonConfirmesComponent } from './indicateurs/ordres-non-confirmes/ordres-non-confirmes.component';
import { PlanningDepartComponent } from './indicateurs/planning-depart/planning-depart.component';
import { SupervisionLivraisonComponent } from './indicateurs/supervision-livraison/supervision-livraison.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'accueil'
  },
  {
    path: 'accueil',
    component: OrdresAccueilComponent,
    canActivate: [AuthGuardService]
  }, 
  {
    path: 'details',
    component: OrdresDetailsComponent,
    canActivate: [AuthGuardService]
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
  {
    path: 'indicateurs/ordresNonConfirmes',
    component: OrdresNonConfirmesComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/commandesTransit',
    component: CommandesTransitComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/planningDepart',
    component: PlanningDepartComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: 'indicateurs/clientsDepEncours',
    component: ClientsDepEncoursComponent,
    canActivate: [AuthGuardService],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrdresRoutingModule { }
