import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../../shared/services';
import { RootComponent } from './root/root.component';

const routes: Routes = [
  {
    path: ':tabid',
    component: RootComponent,
    canActivate: [AuthGuardService],
  },
  {
    path: '',
    component: RootComponent,
    canActivate: [AuthGuardService],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdresRoutingModule {}
