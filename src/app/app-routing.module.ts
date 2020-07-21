import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginFormComponent} from './shared/components';
import {AuthGuardService} from './shared/services';
import {HomeComponent} from './pages/home/home.component';
import {ProfileComponent} from './pages/exemple/profile/profile.component';
import {DisplayDataComponent} from './pages/exemple/display-data/display-data.component';
import {DxDataGridModule, DxFormModule, DxButtonModule} from 'devextreme-angular';
import {SharedModule} from './shared/shared.module';
import {TestGridFormComponent} from './pages/exemple/test-grid-form/test-grid-form.component';
import { environment } from '../environments/environment';

const routes: Routes = [
  {
    path: 'display-data',
    component: DisplayDataComponent,
    canActivate: [AuthGuardService]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuardService],
    outlet: 'gridForm'
  },
  {
    path: 'test-grid-form',
    component: TestGridFormComponent,
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
    path: 'nested',
    canActivate: [AuthGuardService],
    loadChildren: './pages/nested/nested.module#NestedModule',
  },
  {
    path: 'tiers',
    canActivate: [AuthGuardService],
    loadChildren: './pages/tiers/tiers.module#TiersModule'
  },
  {
    path: 'articles',
    canActivate: [AuthGuardService],
    loadChildren: './pages/articles/articles.module#ArticlesModule'
  },
  {
    path: 'stock',
    canActivate: [AuthGuardService],
    loadChildren: './pages/stock/stock.module#StockModule'
  },
  {
    path: '**',
    redirectTo: 'home',
    canActivate: [AuthGuardService]
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { enableTracing: environment.debugRouting }),
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
    DisplayDataComponent,
    TestGridFormComponent
  ]
})
export class AppRoutingModule {
}
