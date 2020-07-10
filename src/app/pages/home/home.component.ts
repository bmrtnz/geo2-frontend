import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
// import {DxButtonModule} from 'devextreme-angular/ui/button';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ]
})

export class HomeComponent {

  public currentDate: Date;

  constructor(private router: Router) {
    this.currentDate = new Date();
  }

  onClickItem(e) {
    const target = e.element.id.replace('-button', '');
    this.router.navigate([`/stock`]);

    // switch(target) {
    //   case 'stock': {
    //     this.router.navigate([`/stock`]);
    //     break;
    //   }
    // }

  }
}
