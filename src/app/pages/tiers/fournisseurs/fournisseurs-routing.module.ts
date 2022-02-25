import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditingGuard } from 'app/shared/guards/editing-guard';
import { NestedGuard } from 'app/shared/guards/nested-guard';
import { FournisseurDetailsComponent } from './details/fournisseur-details.component';
import { FournisseursListComponent } from './list/fournisseurs-list.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full',
  }, {
    path: 'list',
    component: FournisseursListComponent,
  }, {
    path: ':id',
    component: FournisseurDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  }, {
    path: 'create',
    component: FournisseurDetailsComponent,
    canActivate: [NestedGuard],
    canDeactivate: [EditingGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FournisseursRoutingModule { }
