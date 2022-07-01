import { Component, Input, ViewChild } from "@angular/core";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DxLoadIndicatorComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";

@Component({
  selector: "app-button-marge-previ",
  templateUrl: "./button-marge-previ.component.html",
  styleUrls: ["./button-marge-previ.component.scss"]
})
export class ButtonMargePreviComponent {

  public marginText: string;
  @Input() private ordreID: string;
  @ViewChild("smallMarginLoader", { static: false })
  private smallMarginLoader: DxLoadIndicatorComponent;

  constructor(
    private functionsService: FunctionsService,
    private currentCompanyService: CurrentCompanyService,
  ) { }

  calculMargePrev() {

    this.smallMarginLoader.visible = true;
    this.marginText = "";
    this.functionsService.fCalculMargePrevi(this.ordreID, this.currentCompanyService.getCompany().id)
      .valueChanges
      .subscribe({
        next: res => {
          const margin = res.data.fCalculMargePrevi.data.result;
          this.smallMarginLoader.visible = false;
          if (margin !== null) this.marginText = ": " + margin + " %";
        },
        error: (message: string) => {
          this.smallMarginLoader.visible = false;
          notify({ message }, "error", 7000);
          console.log(message);
        }
      });
  }

}
