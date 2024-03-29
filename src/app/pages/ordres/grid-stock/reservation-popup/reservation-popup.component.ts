import { Component, EventEmitter, Input, Output, ViewChild } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";
import { EdiLigne } from "app/shared/models";
import Ordre from "app/shared/models/ordre.model";
import StockArticle from "app/shared/models/stock-article.model";
import { LocalizationService } from "app/shared/services";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { StocksService } from "app/shared/services/api/stocks.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  DxNumberBoxComponent,
  DxPopupComponent,
  DxTextBoxComponent
} from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { lastValueFrom } from "rxjs";
import { concatMap } from "rxjs/operators";

@Component({
  selector: "app-reservation-popup",
  templateUrl: "./reservation-popup.component.html",
  styleUrls: ["./reservation-popup.component.scss"],
})
export class ReservationPopupComponent {
  @Input() public ediLigneID: EdiLigne["id"];
  @Output() public ajoutReservation = new EventEmitter();

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxTextBoxComponent, { static: false })
  commentBox: DxTextBoxComponent;
  @ViewChild(DxNumberBoxComponent, { static: false })
  quantiteBox: DxNumberBoxComponent;

  public negativeStock = false;
  public rowData: {
    stockArticle: Partial<StockArticle>;
    ordre: Partial<Ordre>;
  };

  public formGroup = this.formBuilder.group({
    commentaire: [""],
    quantite: [""],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ordreLignesService: OrdreLignesService,
    private stocksService: StocksService,
    public localizeService: LocalizationService,
    private currentCompanyService: CurrentCompanyService
  ) { }

  clickSubmitBtn() {
    const submitBtn = document.getElementById(
      "submitReservationBtn"
    ) as HTMLElement;
    submitBtn.click();
  }

  onSubmit() {
    notify(
      this.localizeService.localize("ajout-article") + "...",
      "info",
      3000
    );
    this.stocksService
      .reservationStock(
        this.rowData.ordre?.id,
        this.rowData.stockArticle.articleID,
        this.currentCompanyService.getCompany().id,
        this.rowData.stockArticle.stockID,
        this.formGroup.get("quantite").value,
        this.formGroup.get("commentaire").value
      )
      .pipe(
        concatMap(async res => {
          if (this.ediLigneID)
            await lastValueFrom(this.ordreLignesService.save_v2(["id"], {
              ordreLigne: {
                id: res.data.reservationStock.data.new_orl_ref,
                ediLigne: { id: this.ediLigneID },
              },
            }));
          return res;
        }),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
          notify(
            error.message.replace(
              "Exception while fetching data (/reservationStock) : ",
              ""
            ),
            "error",
            7000
          );
        },
        complete: () => {
          this.ajoutReservation.emit();
        },
      });
    this.popup.instance.hide();
  }

  onHidden() {
    this.negativeStock = false;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("destockage-popup");
    this.quantiteBox?.instance.focus();
  }

  present(stockArticle: Partial<StockArticle>, ordre: Partial<Ordre>) {
    this.rowData = { stockArticle, ordre };
    this.popup.instance.show();
    this.formGroup.reset();
    this.formGroup
      .get("commentaire")
      .setValue(
        `Ordre ${ordre.campagne.id}-${ordre.numero} / ${ordre.entrepot.code}`
      );
  }

  onQuantiteChange(e) {
    const quantite =
      this.rowData.stockArticle.quantiteCalculee1 ||
      0 + this.rowData.stockArticle.quantiteCalculee2 ||
      0 + this.rowData.stockArticle.quantiteCalculee3 ||
      0 + this.rowData.stockArticle.quantiteCalculee4 ||
      0;
    this.negativeStock = quantite - e.value < 0 && e.value;
  }
}
