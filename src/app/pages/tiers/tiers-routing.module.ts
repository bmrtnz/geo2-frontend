import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ContactsComponent } from './contacts/contacts.component';
import {ClientHomeComponent} from './clients/home/client-home.component';
import {ClientDetailsComponent} from './clients/details/client-details.component';
import {AuthGuardService} from '../../shared/services';

const routes: Routes = [
  {
    path: 'clients',
    component: ClientHomeComponent,
    children: [
      {
        path: ':id',
        component: ClientDetailsComponent
      }, {
        path: ':id/contacts',
        component: ContactsComponent,
        canActivate: [AuthGuardService]
      }, {
        path: ':client/entrepots',
        loadChildren: './entrepots/entrepots.module#EntrepotsModule'
      }
    ]
    // loadChildren: './clients/clients.module#ClientsModule'
  }, {
    path: 'fournisseurs',
    loadChildren: './fournisseurs/fournisseurs.module#FournisseursModule'
  }, {
    path: 'transporteurs',
    loadChildren: './transporteurs/transporteurs.module#TransporteursModule'
  } , {
    path: 'lieux-passage-a-quai',
    loadChildren: './lieux-passage-a-quai/lieux-passage-a-quai.module#LieuxPassageAQuaiModule'
  }, {
    path: 'entrepots',
    loadChildren: './entrepots/entrepots.module#EntrepotsModule'
  },  {
    path: 'contacts/:type/:id',
    component: ContactsComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TiersRoutingModule { }
