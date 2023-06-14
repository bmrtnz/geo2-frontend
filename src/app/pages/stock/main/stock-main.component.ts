import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import { ModelFieldOptions } from "app/shared/models/model";
import { SecteursService } from "app/shared/services/api/secteurs.service";
import { StockArticlesAgeService } from "app/shared/services/api/stock-articles-age.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import { DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { Observable } from "rxjs";
import { ClientsService } from "../../../shared/services/api/clients.service";
import { FournisseursService } from "../../../shared/services/api/fournisseurs.service";
import {
  StockCategory,
  StockService,
} from "../../../shared/services/api/stock.service";

@Component({
  selector: "app-stock-main",
  templateUrl: "./stock-main.component.html",
  styleUrls: ["./stock-main.component.scss"],
})
export class StockMainComponent implements OnInit {
  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;
  now: number;
  linesCount: number;

  stockCategories: StockCategory[];

  constructor(public stocksService: StockService) {}

  ngOnInit() {
    this.stockCategories = this.stocksService.stockCategories;
  }
}
