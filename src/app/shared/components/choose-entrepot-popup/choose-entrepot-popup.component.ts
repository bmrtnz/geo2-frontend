import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Entrepot, Societe } from "app/shared/models";
import { ClientsService, EntrepotsService } from "app/shared/services";
import { SocietesService } from "app/shared/services/api/societes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { SharedModule } from "app/shared/shared.module";
import {
  DxButtonModule,
  DxPopupComponent,
  DxPopupModule,
  DxSelectBoxComponent,
  DxSelectBoxModule,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { EMPTY, of } from "rxjs";
import { concatMap, first, tap } from "rxjs/operators";

@Component({
  selector: "app-choose-entrepot-popup",
  templateUrl: "./choose-entrepot-popup.component.html",
  styleUrls: ["./choose-entrepot-popup.component.scss"],
})
export class ChooseEntrepotPopupComponent implements OnInit {
  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;
  @ViewChild("entrepotInput") public entrepotInput: DxSelectBoxComponent;
  @ViewChild("clientInput") public clientInput: DxSelectBoxComponent;
  @ViewChild("societeInput") public societeInput: DxSelectBoxComponent;
  private choosed = new EventEmitter<{ entrepotID: Entrepot["id"], societeID: Societe["id"] }>();
  public societesSource: DataSource;
  public entrepotsSource: DataSource;
  public clientsSource: DataSource;

  constructor(
    private societesService: SocietesService,
    private entrepotsService: EntrepotsService,
    private currentCompanyService: CurrentCompanyService,
    private clientsService: ClientsService
  ) { }

  ngOnInit() {
    this.societesSource = this.societesService.getDataSource();
    this.societesSource.filter(["valide", "=", true]);
    this.clientsSource = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
  }

  /** Present the popup */
  public prompt() {
    this.popup.visible = true;
    return this.choosed.pipe(
      first(), // promise compatibility
      concatMap((res) => (res ? of(res) : EMPTY))
    );
  }

  public onSelectClick() {
    this.popup.visible = false;
    this.choosed.emit({ entrepotID: this.entrepotInput.value, societeID: this.societeInput.value });
  }

  public onCancelClick() {
    this.popup.visible = false;
    this.choosed.emit();
  }

  public onSocieteSelectionChanged() {
    this.clientInput.instance.reset();
    // re-requesting the datasource, otherwise, the next filter won't be applied
    this.clientsSource = this.clientsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.clientsSource.filter([
      ["valide", "=", true],
      "and",
      ["societe.id", "=", this.societeInput.value],
    ]);
  }

  public onClientSelectionChanged() {
    this.entrepotInput.instance.reset();
    // re-requesting the datasource, otherwise, the next filter won't be applied
    this.entrepotsSource = this.entrepotsService.getDataSource_v2([
      "id",
      "code",
      "raisonSocial",
    ]);
    this.entrepotsSource.filter([
      ["valide", "=", true],
      "and",
      ["client.id", "=", this.clientInput.value],
    ]);
    // Auto-select when only one entrepot assigned to the client
    this.entrepotsSource.load().then((res) => {
      if (res?.length === 1) this.entrepotInput.value = res[0].id;
    });
  }

  public onShowing(e) {
    e.component.content().parentNode.classList.add("choose-entrepot-popup");
  }

  public onShown() {
    if (this.societeInput) this.societeInput.value = this.currentCompanyService.getCompany().id;
    if (this.clientInput) setTimeout(() => this.clientInput.instance.focus(), 500);
  }

  public onHidden() {
    this.societeInput.instance.reset();
    this.clientInput.instance.reset();
    this.entrepotInput.instance.reset();
  }

  public displayCodeBefore(data) {
    return data
      ? (data.code ? data.code : data.id) +
      " - " +
      (data.nomUtilisateur
        ? data.nomUtilisateur
        : data.raisonSocial
          ? data.raisonSocial
          : data.description)
      : null;
  }
}

@NgModule({
  imports: [DxPopupModule, DxSelectBoxModule, DxButtonModule, SharedModule],
  declarations: [ChooseEntrepotPopupComponent],
  exports: [ChooseEntrepotPopupComponent],
})
export class ChooseEntrepotPopupModule { }
