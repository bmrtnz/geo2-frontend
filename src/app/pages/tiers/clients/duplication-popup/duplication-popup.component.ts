import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  ViewChild,
} from "@angular/core";
import { Client } from "app/shared/models";
import { ClientsService } from "app/shared/services";
import { SocietesService } from "app/shared/services/api/societes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  DxPopupComponent,
  DxSelectBoxComponent,
  DxSwitchComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { defer } from "rxjs";
import { concatMapTo, finalize, first, tap } from "rxjs/operators";

@Component({
  selector: "app-duplication-popup",
  templateUrl: "./duplication-popup.component.html",
  styleUrls: ["./duplication-popup.component.scss"],
})
export class DuplicationPopupComponent implements OnInit {
  @Input() client: Partial<Client>;
  @ViewChild(DxPopupComponent) private popup: DxPopupComponent;
  @ViewChild("societeInput") public societeInput: DxSelectBoxComponent;
  @ViewChild("copyContactsInput") public copyContactsInput: DxSwitchComponent;
  @ViewChild("copyEntrepsInput") public copyEntrepsInput: DxSwitchComponent;
  @ViewChild("copyEntrepsContactsInput")
  public copyEntrepsContactsInput: DxSwitchComponent;
  private done = new EventEmitter();
  public societesSource: DataSource;

  constructor(
    private societesService: SocietesService,
    private clientsService: ClientsService,
    private currentCompanyService: CurrentCompanyService
  ) {}

  ngOnInit() {
    this.societesSource = this.societesService.getDataSource();
    this.societesSource.filter([
      ["valide", "=", true],
      "and",
      ["id", "<>", this.currentCompanyService.getCompany().id],
    ]);
  }

  /** Present the popup */
  public prompt() {
    this.popup.visible = true;
    return this.done.pipe(
      concatMapTo(
        defer(() =>
          this.clientsService.duplicate(
            new Set(["id"]),
            this.client.id,
            this.currentCompanyService.getCompany().id,
            this.societeInput.value,
            this.copyContactsInput.value,
            this.copyEntrepsContactsInput.value,
            this.copyEntrepsInput.value
          )
        )
      ),
      first(),
      finalize(() => (this.popup.visible = false))
    );
  }

  public onSelectClick() {
    // this.popup.visible = false;
    this.done.emit();
  }

  public onCancelClick() {
    this.popup.visible = false;
    // this.done.emit();
  }
}
