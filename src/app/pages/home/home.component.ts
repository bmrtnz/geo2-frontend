import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
// import {DxButtonModule} from 'devextreme-angular/ui/button';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ]
})

export class HomeComponent {

  public currentDate: Date;

  constructor() {
    this.currentDate = new Date();
  }
}
