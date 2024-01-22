import { Component, Input, NgModule, OnChanges } from "@angular/core";
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
  @Input() numeroPo: string;


  public fullAddress: string;
  public date: string;
  public title: string;


  constructor(
    public dateMgtService: DateManagementService,
    public localization: LocalizationService,
  ) { }


  ngOnChanges() {
    this.date = this.dateMgtService.formatDate(new Date(), "dd/MM/yyyy");
    this.title = this.localization.localize(`document-${this.document}`);
  }

}

@NgModule({
  declarations: [GenerateDocumentComponent],
  imports: [SharedModule],
  exports: [GenerateDocumentComponent],
})
export class GenerateDocumentModule { }
