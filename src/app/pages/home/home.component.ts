import {Component, isDevMode, ViewChild, OnInit} from '@angular/core';
import { NavHomeList, NavHomeService } from 'app/shared/services/home.service';
import { Router } from '@angular/router';
import { DxDrawerComponent } from 'devextreme-angular';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: [ './home.component.scss' ],
  providers: [NavHomeService],
})

export class HomeComponent implements OnInit {

  @ViewChild(DxDrawerComponent, { static: false }) drawer: DxDrawerComponent;
  public currentDate: Date;
  public navigation: NavHomeList[];
  public prod = !isDevMode();

  constructor(private router: Router, service: NavHomeService) {
    this.currentDate = new Date();
    this.navigation = service.getNavigationList();
  }

  ngOnInit() {
    window.localStorage.removeItem('openOrders');
  }

  onClickMultipleMenu(e) {
    this.drawer.instance.toggle();
  }

  onClickItem(e) {
    const target = e.element.id.replace('-button', '');
    this.router.navigate([`/stock`]);
  }

  navigate(view, nested?) {
    if (nested) {
      this.router.navigateByUrl('/nested/n/(' + view  + ')');
    } else {
      this.router.navigateByUrl(view);
    }
  }

  navigateItemList(e) {
    this.router.navigateByUrl('/nested/n/(' + e.itemData.path + '/list)');
  }

}
