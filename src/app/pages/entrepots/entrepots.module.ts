import {NgModule} from '@angular/core';

import {EntrepotsRoutingModule} from '../entrepots/entrepots-routing.module';
import {SharedModule} from '../../shared/shared.module';


@NgModule({
  declarations: [],
  imports: [
    SharedModule,
    EntrepotsRoutingModule
  ]
})
export class EntrepotsModule { }
