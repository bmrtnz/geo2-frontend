import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module';
import { ProfileGuard } from './profile/profile.guard';
import { PagesComponent } from './pages/pages.component';

const routes: Routes = [
  {
    path: 'profile',
    loadChildren: './profile/profile.module#ProfileModule',
  },
  {
    path: 'pages',
    loadChildren: './pages/pages.module#PagesModule',
    canActivateChild: [ProfileGuard],
  },
  {
    path: '**',
    redirectTo: 'pages',
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      enableTracing: environment.debugRouting,
      onSameUrlNavigation: 'reload',
    }),
    SharedModule
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
