import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';

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
  }, {
    path: 'lieux-passage-a-quai',
    loadChildren: './lieux-passage-a-quai/lieux-passage-a-quai.module#LieuxPassageAQuaiModule'
  }, {
    path: 'entrepots',
    loadChildren: './entrepots/entrepots.module#EntrepotsModule'
  },  {
    path: 'contacts/:codeTiers/:typeTiers',
    component: ContactsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiersRoutingModule { }
