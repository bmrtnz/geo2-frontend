import { Component, EventEmitter, NgModule, ViewChild } from "@angular/core";
import { CertificationFournisseur } from "app/shared/models";
import { AuthService } from "app/shared/services";
import { SharedModule } from "app/shared/shared.module";
import {
  DxButtonModule,
  DxDataGridComponent,
  DxDataGridModule,
  DxPopupComponent,
  DxPopupModule,
} from "devextreme-angular";
import { RequiredRule } from "devextreme/ui/validation_rules";
import { take } from "rxjs/operators";

@Component({
  selector: "app-certification-date-popup",
  templateUrl: "./certification-date-popup.component.html",
  styleUrls: ["./certification-date-popup.component.scss"],
})
export class CertificationDatePopupComponent {
  @ViewChild(DxPopupComponent, { static: false })
  popupComponent: DxPopupComponent;

  @ViewChild(DxDataGridComponent, { static: false })
  dataGrid: DxDataGridComponent;

  alterate = new EventEmitter<CertificationFournisseur[]>();

  dateValidationRules: RequiredRule[] = [{ type: "required" }];
  certifications: CertificationFournisseur[];

  constructor(
    public authService: AuthService,
  ) { }

  async onSubmit() {
    await this.dataGrid.instance.saveEditData();
    if (this.certifications.every(({ dateValidite }) => dateValidite)) {
      this.alterate.emit(this.certifications);
      this.popupComponent.instance.hide();
    }
  }

  onHiding() {
    // this.dateValidationRules = [];
  }

  onShowing() {
    // this.dateValidationRules = [
    //   { type: 'required' },
    // ];
  }

  onCellPrepared(event) {
    if (event.rowType === "data" && event.column.dataField === "dateValidite")
      if (!event.value) event.cellElement.classList.add("dx-datagrid-invalid");
  }

  present(data) {
    this.certifications = data;
    this.popupComponent.instance.show();
    return this.alterate.asObservable().pipe(take(1));
  }

  onToolbarPreparing({ toolbarOptions }: { toolbarOptions: any }) {
    toolbarOptions.items.shift();
  }
}

@NgModule({
  declarations: [CertificationDatePopupComponent],
  imports: [SharedModule, DxDataGridModule, DxPopupModule, DxButtonModule],
  exports: [CertificationDatePopupComponent],
})
export class CertificationDatePopupModule { }
