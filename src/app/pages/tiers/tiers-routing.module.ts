import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: 'clients',
    loadChildren: './clients/clients.module#ClientsModule'
  }, {
    path: 'fournisseurs',
    loadChildren: './fournisseurs/fournisseurs.module#FournisseursModule'
  }, {
    path: 'transporteurs',
    loadChildren: './transporteurs/transporteurs.module#TransporteursModule'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiersRoutingModule { }
