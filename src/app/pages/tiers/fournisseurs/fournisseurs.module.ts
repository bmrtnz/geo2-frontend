import {NgModule} from '@angular/core';

import {FournisseursRoutingModule} from './fournisseurs-routing.module';
import {SharedModule} from '../../../shared/shared.module';
import { FournisseursListComponent } from './list/fournisseurs-list.component';


@NgModule({
  declarations: [FournisseursListComponent],
  imports: [
    SharedModule,
    FournisseursRoutingModule
  ]
})
export class FournisseursModule { }
