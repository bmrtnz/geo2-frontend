import { Component } from '@angular/core';

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
