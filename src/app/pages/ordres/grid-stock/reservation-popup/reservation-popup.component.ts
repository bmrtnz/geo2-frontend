import { Component, EventEmitter, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, NgForm, Validators } from "@angular/forms";
import { ApolloQueryResult, FetchResult } from "@apollo/client/core";
import Ordre from "app/shared/models/ordre.model";
import StockArticle from "app/shared/models/stock-article.model";
import { FunctionResponse, FunctionsService } from "app/shared/services/api/functions.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxNumberBoxComponent, DxPopupComponent, DxTextBoxComponent, DxValidatorComponent } from "devextreme-angular";
import { Observable } from "rxjs";
import { concatAll, take, takeWhile, tap } from "rxjs/operators";

@Component({
  selector: "app-reservation-popup",
  templateUrl: "./reservation-popup.component.html",
  styleUrls: ["./reservation-popup.component.scss"]
})
export class ReservationPopupComponent {

  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild(DxTextBoxComponent, { static: false })
  commentBox: DxTextBoxComponent;
  @ViewChild("validatorCommentaire", { static: false })
  validatorCommentaire: DxValidatorComponent;

  @ViewChild(DxNumberBoxComponent, { static: false })
  quantiteBox: DxNumberBoxComponent;
  @ViewChild("validatorQuantite", { static: false })
  validatorQuantite: DxValidatorComponent;

  public negativeStock = false;
  persist = new EventEmitter<Observable<ApolloQueryResult<{
    reservationStock: FunctionResponse<Record<string, any>>;
  }>>>();
  private rowData: { stockArticle: Partial<StockArticle>, ordre: Partial<Ordre> };

  public formGroup = this.formBuilder.group({
    commentaire: [""],
    quantite: [""],
  });

  constructor(
    private formBuilder: FormBuilder,
    private stocksService: StocksService,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  async onSubmit() {
    const save = this.stocksService
      .reservationStock(
        this.rowData.ordre?.id,
        this.rowData.stockArticle.articleID,
        this.currentCompanyService.getCompany().id,
        this.rowData.stockArticle.stockID,
        this.formGroup.get("quantite").value,
        this.formGroup.get("commentaire").value,
      )
      .valueChanges
      .pipe(
        takeWhile(res => res.loading)
      );
    this.persist.emit(save);
    this.popupComponent.instance.hide();
  }

  onHidden() {
    this.formGroup.reset();
  }

  onShown() {
    this.quantiteBox.instance.focus();
  }

  present(stockArticle: Partial<StockArticle>, ordre: Partial<Ordre>) {
    this.rowData = { stockArticle, ordre };
    this.popupComponent.instance.show();
    this.formGroup.get("commentaire")
      .setValue(`ordre ${ordre.numero} / ${ordre.entrepot.code}`);
    return this.persist.asObservable().pipe(take(1), concatAll());
  }

  onQuantiteChange() {
    const quantite = this.rowData.stockArticle.quantiteCalculee1
      + this.rowData.stockArticle.quantiteCalculee2
      + this.rowData.stockArticle.quantiteCalculee3
      + this.rowData.stockArticle.quantiteCalculee4;
    this.negativeStock = quantite - this.formGroup.get("quantite").value < 0;
  }

}
