import { Component } from "@angular/core";
import { VersionService } from "app/shared/services/version.service";

@Component({
  selector: "app-pages",
  templateUrl: "./pages.component.html",
  styleUrls: ["./pages.component.scss"],
})
export class PagesComponent {
  public static readonly START_DEV_YEAR: number = 2020;
  public copyrightYear = "";

  constructor(public versionService: VersionService) {
    const year = new Date().getFullYear();
    if (year !== PagesComponent.START_DEV_YEAR) {
      this.copyrightYear = "-" + year;
    }
  }
}
