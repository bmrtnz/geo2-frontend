import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../../shared/services';
import { RootComponent } from './root/root.component';

const routes: Routes = [
  {
    path: '',
    component: RootComponent,
    canActivate: [AuthGuardService],
  },
  // {
  //   path: 'details',
  //   component: OrdresDetailsComponent,
  //   canActivate: [AuthGuardService]
  // },
  // {
  //   path: 'indicateurs/litiges',
  //   component: LitigesComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/bonAFacturer',
  //   component: BonAFacturerComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/supervisionLivraison',
  //   component: SupervisionLivraisonComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/ordresNonClotures',
  //   component: OrdresNonCloturesComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/ordresNonConfirmes',
  //   component: OrdresNonConfirmesComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/commandesTransit',
  //   component: CommandesTransitComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/planningDepart',
  //   component: PlanningDepartComponent,
  //   canActivate: [AuthGuardService],
  // },
  // {
  //   path: 'indicateurs/clientsDepEncours',
  //   component: ClientsDepEncoursComponent,
  //   canActivate: [AuthGuardService],
  // }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdresRoutingModule {}
