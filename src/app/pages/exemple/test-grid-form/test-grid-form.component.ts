import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import clients from "../../../shared/data/clients";

@Component({
    selector: "app-test-grid-form",
    templateUrl: "./test-grid-form.component.html",
    styleUrls: ["./test-grid-form.component.scss"],
})
export class TestGridFormComponent implements OnInit {
    clientsDS = clients;

    constructor(private router: Router) {}

    ngOnInit() {}

    onRowDblClick(e: any) {
        this.router.navigate([{ outlets: { gridForm: `/profile` } }]);
    }
}
