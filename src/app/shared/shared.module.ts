import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {LocalizePipe} from './pipes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [LocalizePipe],
  exports: [LocalizePipe]
})
export class SharedModule { }
