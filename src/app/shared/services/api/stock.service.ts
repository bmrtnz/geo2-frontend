import { Injectable } from "@angular/core";
import { LocalizationService } from "../localization.service";

export class StockCategory {
  id: number;
  stockName: string;
}

@Injectable({
  providedIn: "root",
})
export class StockService {
  constructor(private localizationService: LocalizationService) {}

  public stockCategories: StockCategory[] = [
    {
      id: 0,
      stockName: this.localizationService.localize(
        "ordreStock-stock-produits-finis"
      ),
    },
    {
      id: 1,
      stockName: this.localizationService.localize(
        "ordreStock-stock-precalibre"
      ),
    },
  ];
}
