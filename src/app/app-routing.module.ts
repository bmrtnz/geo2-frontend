import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginFormComponent} from './shared/components';
import {AuthGuardService} from './shared/services';
import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/exemple/profile/profile.component';
import {DisplayDataComponent} from './pages/exemple/display-data/display-data.component';
import {DxDataGridModule, DxFormModule, DxButtonModule} from 'devextreme-angular';
import {SharedModule} from './shared/shared.module';
// import { ContactsComponent } from './pages/contacts/contacts.component';

const routes: Routes = [
  {
    path: 'display-data',
    component: DisplayDataComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'login',
    component: LoginFormComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'tiers',
    canActivate: [AuthGuardService],
    loadChildren: './pages/tiers/tiers.module#TiersModule'
  },
  {
    path: 'entrepots',
    canActivate: [AuthGuardService],
    loadChildren: './pages/tiers/entrepots/entrepots.module#EntrepotsModule'
  },
  {
    path: 'contacts',
    canActivate: [AuthGuardService],
    loadChildren: './pages/tiers/contacts/contacts.module#ContactsModule'
  },
  {
    path: '**',
    redirectTo: 'home',
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    DxDataGridModule,
    DxFormModule,
    DxButtonModule,
    SharedModule
  ],
  exports: [RouterModule],
  providers: [AuthGuardService],
  declarations: [
    HomeComponent,
    ProfileComponent,
    DisplayDataComponent
  ]
})
export class AppRoutingModule {
}
