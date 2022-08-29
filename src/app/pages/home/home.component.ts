import { Component, isDevMode, ViewChild, OnInit } from "@angular/core";
import { NavHomeList, NavHomeService } from "app/shared/services/home.service";
import { Router } from "@angular/router";
import { DxDrawerComponent } from "devextreme-angular";

@Component({
  templateUrl: "home.component.html",
  styleUrls: ["./home.component.scss"],
  providers: [NavHomeService],
})
export class HomeComponent implements OnInit {
  @ViewChild(DxDrawerComponent, { static: false }) drawer: DxDrawerComponent;
  public currentDate: Date;
  public navigation: NavHomeList[];
  public dev = isDevMode();

  constructor(private router: Router, service: NavHomeService) {
    this.currentDate = new Date();
    this.navigation = service.getNavigationList();
  }

  ngOnInit() { }

  onClickMultipleMenu(e) {
    this.drawer.instance.toggle();
  }

  onClickItem(e) {
    const target = e.element.id.replace("-button", "");
    this.router.navigate([`/pages/stock`]);
  }

  navigate(view, nested?) {
    console.log(view);
    if (nested) {
      this.router.navigateByUrl("/pages/nested/n/(" + view + ")");
    } else {
      this.router.navigateByUrl(view);
    }
  }

  navigateItemList(e) {
    this.router.navigateByUrl(
      "/pages/nested/n/(" + e.itemData.path + "/list)",
    );
  }
}
