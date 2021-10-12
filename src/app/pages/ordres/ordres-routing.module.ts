import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuardService } from '../../shared/services';
import { RootComponent } from './root/root.component';
import { OrdresTabsPersistGuard } from 'app/shared/guards/ordres-tabs-persist.guard';

const routes: Routes = [
  {
    path: ':tabid',
    component: RootComponent,
    canActivate: [AuthGuardService],
    canDeactivate: [OrdresTabsPersistGuard],
  },
  {
    path: '',
    component: RootComponent,
    canActivate: [AuthGuardService, OrdresTabsPersistGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrdresRoutingModule {}
