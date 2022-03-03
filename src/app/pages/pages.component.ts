import { Component } from "@angular/core";
import { version } from "../../../package.json";

@Component({
    selector: "app-pages",
    templateUrl: "./pages.component.html",
    styleUrls: ["./pages.component.scss"],
})
export class PagesComponent {
    public static readonly START_DEV_YEAR: number = 2020;
    public readonly version = version;
    public copyrightYear = "";

    constructor() {
        const year = new Date().getFullYear();
        if (year !== PagesComponent.START_DEV_YEAR) {
            this.copyrightYear = "-" + year;
        }
    }
}
