import { Component, ElementRef, Input, NgModule, OnChanges } from "@angular/core";
import { SharedModule } from "../../shared.module";
import { DateManagementService } from "app/shared/services/date-management.service";
import { LocalizationService } from "app/shared/services";
import Ordre from "app/shared/models/ordre.model";


@Component({
  selector: "app-generate-document",
  templateUrl: "./generate-document.component.html",
  styleUrls: ["./generate-document.component.scss"],
})
export class GenerateDocumentComponent implements OnChanges {

  @Input() document: string;
  @Input() address: string;
  @Input() ordre: Ordre;
  @Input() ordres: any[];
  @Input() numeroPo: string;
  @Input() totaux: { colis: number, gross: number, net: number };
  @Input() previewProcess: boolean;
  @Input() sendPrinterProcess: boolean;
  @Input() printDate;
  @Input() containers: any[];


  public fullAddress: string;
  public date: string;
  public title: string;


  constructor(
    public dateMgtService: DateManagementService,
    public localization: LocalizationService,
  ) { }


  ngOnChanges() {
    this.title = this.localization.localize(`document-${this.document}`);
  }

  listOrdres() {
    if (this.ordres) return this.ordres.map(ord => ord.numero).join(" ");
  }

  numMgt(num, digits = 1) {
    return num ? num.toFixed(digits).replace(".", ",") : "";
  }

}

@NgModule({
  declarations: [GenerateDocumentComponent],
  imports: [SharedModule],
  exports: [GenerateDocumentComponent],
})
export class GenerateDocumentModule { }
