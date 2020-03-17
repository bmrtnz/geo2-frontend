import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LieuxPassageAQuaiDetailsComponent } from './details/lieux-passage-a-quai-details.component';
import { LieuxPassageAQuaiListComponent } from './list/lieux-passage-a-quai-list.component';



@NgModule({
  declarations: [LieuxPassageAQuaiDetailsComponent, LieuxPassageAQuaiListComponent],
  imports: [
    CommonModule
  ]
})
export class LieuxPassageAQuaiModule { }
