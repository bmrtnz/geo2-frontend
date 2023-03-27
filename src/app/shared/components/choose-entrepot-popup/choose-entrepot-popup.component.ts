import { Component, EventEmitter, NgModule, OnInit, ViewChild } from "@angular/core";
import { Entrepot } from "app/shared/models";
import { EntrepotsService } from "app/shared/services";
import { SocietesService } from "app/shared/services/api/societes.service";
import { SharedModule } from "app/shared/shared.module";
import { DxButtonModule, DxPopupComponent, DxPopupModule, DxSelectBoxComponent, DxSelectBoxModule } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { EMPTY, of } from "rxjs";
import { concatMap, first } from "rxjs/operators";

@Component({
  selector: "app-choose-entrepot-popup",
  templateUrl: "./choose-entrepot-popup.component.html",
  styleUrls: ["./choose-entrepot-popup.component.scss"]
})
export class ChooseEntrepotPopupComponent implements OnInit {

  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;
  @ViewChild("entrepotInput") protected entrepotInput: DxSelectBoxComponent;
  @ViewChild("societeInput") protected societeInput: DxSelectBoxComponent;
  private choosed = new EventEmitter<Entrepot["id"]>();
  protected societesSource: DataSource;
  protected entrepotsSource: DataSource;

  constructor(
    private societesService: SocietesService,
    private entrepotsService: EntrepotsService,
  ) { }

  ngOnInit() {
    this.societesSource = this.societesService.getDataSource();
    this.societesSource.filter(["valide", "=", true]);
    this.entrepotsSource = this.entrepotsService.getDataSource_v2(["id", "code", "raisonSocial"]);
  }

  /** Present the popup */
  public prompt() {
    this.popup.visible = true;
    return this.choosed.pipe(
      first(), // promise compatibility
      concatMap(res => res ? of(res) : EMPTY),
    );
  }

  protected onSelectClick() {
    this.popup.visible = false;
    this.choosed.emit(this.entrepotInput.value);
  }

  protected onCancelClick() {
    this.popup.visible = false;
    this.choosed.emit();
  }

  protected onSocieteSelectionChanged() {
    this.entrepotInput.instance.reset();
    // re-requesting the datasource, otherwise, the next filter won't be applied
    this.entrepotsSource = this.entrepotsService
      .getDataSource_v2(["id", "code", "raisonSocial"]);
    this.entrepotsSource.filter([
      ["valide", "=", true],
      "and",
      ["societe.id", "=", this.societeInput.value],
    ]);
  }

  protected onHidden() {
    this.entrepotInput.instance.reset();
  }

}

@NgModule({
  imports: [
    DxPopupModule,
    DxSelectBoxModule,
    DxButtonModule,
    SharedModule,
  ],
  declarations: [ChooseEntrepotPopupComponent],
  exports: [ChooseEntrepotPopupComponent],
})
export class ChooseEntrepotPopupModule { }
