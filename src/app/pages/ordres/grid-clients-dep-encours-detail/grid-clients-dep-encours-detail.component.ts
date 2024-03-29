import { DatePipe } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { EncoursClientPopupComponent } from "app/pages/tiers/clients/encours-client/encours-client-popup.component";
import { Client } from "app/shared/models";
import { LocalizePipe } from "app/shared/pipes";
import { AuthService, ClientsService } from "app/shared/services";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxCheckBoxComponent, DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { dxDataGridRowObject } from "devextreme/ui/data_grid";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-clients-dep-encours-detail",
  templateUrl: "./grid-clients-dep-encours-detail.component.html",
  styleUrls: ["./grid-clients-dep-encours-detail.component.scss"],
})
export class GridClientsDepEncoursDetailComponent implements OnChanges {
  @Input() masterRow: dxDataGridRowObject;
  @Input() client: any;
  @Input() commercialId: any;
  @Input() showAllClients: boolean;
  @Input() onlyValidClients: boolean;
  @Input() secteurId: any;
  @Input() public subHeaders: boolean;
  @Output() openEncoursOrder = new EventEmitter<any>();

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public title: string;

  @ViewChild(EncoursClientPopupComponent, { static: false }) encoursPopup: EncoursClientPopupComponent;
  @ViewChild("validClients", { static: false }) valideSB: DxCheckBoxComponent;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    private localizePipe: LocalizePipe,
    private datePipe: DatePipe,
    private clientsService: ClientsService,
    public authService: AuthService,
    public gridConfiguratorService: GridConfiguratorService,
    public currentCompanyService: CurrentCompanyService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.DepassementEncoursClient
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.title = this.localizePipe.transform(
      "grid-depassement-encours-client-title"
    );
  }

  async ngOnChanges() {
    const fields = this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
    this.dataSource = this.clientsService.getDataSource_v2(
      await fields.toPromise()
    );
    if (this.dataSource) this.enableFilters();
    this.showHideHeaderPanel();
  }

  showHideHeaderPanel() {
    const dxDetailGridHeaderPanel = this.datagrid.instance.$element()[0].querySelector('.dx-datagrid-header-panel');
    this.subHeaders ? dxDetailGridHeaderPanel?.classList.remove('display-none') : dxDetailGridHeaderPanel?.classList.add('display-none');
  }

  enableFilters() {
    this.dataSource.filter([
      ["pays.id", "=", this.masterRow.data.id],
      "and",
      ["societe.id", "=", this.currentCompanyService.getCompany().id],
      ...(this.onlyValidClients ? ["and", ["valide", "=", true]] : []),
      ...(this.showAllClients ? [] : ["and", ["depassement", ">", 0]]),
      ...(this.secteurId ? ["and", ["secteur.id", "=", this.secteurId]] : []),
      ...(this.commercialId
        ? ["and", ["commercial.id", "=", this.commercialId]]
        : []),
    ]);
  }

  onCellPrepared(event) {
    if (event.rowType === "header") {
      let classPrefix;
      switch (event.column.dataField) {
        case "enCoursNonEchu":
        case "enCours1a30":
          classPrefix = "green";
          break;
        case "enCours31a60":
          classPrefix = "yellow";
          break;
        case "enCours61a90":
          classPrefix = "orange";
          break;
        case "enCours90Plus":
          classPrefix = "red";
          break;
        case "alerteCoface":
          classPrefix = "dark-red";
          break;
      }
      if (classPrefix)
        event.cellElement.classList.add(`${classPrefix}-encours`);
    }

    if (event.rowType === "data") {
      // Highlight some >0 cells
      if (
        [
          "depassement",
          "enCours61a90",
          "enCours90Plus",
          "alerteCoface",
        ].includes(event.column.dataField)
      )
        if (event.value > 0) event.cellElement.classList.add("highlight-err");

      // Formating figures: 1000000 becomes 1 000 000 €
      if (
        event.column.dataType === "number" &&
        !event.cellElement.innerText.includes("€")
      ) {
        event.cellElement.innerText =
          event.cellElement.innerText
            .split("")
            .reverse()
            .join("")
            .replace(/([0-9]{3})/g, "$1 ")
            .split("")
            .reverse()
            .join("") + " €";
      }

      if (event.column.dataField === "raisonSocial") {
        const originalText = (event.cellElement as HTMLElement).innerText;
        if (event.data.enCoursDouteux > 0) {
          (
            event.cellElement as HTMLElement
          ).innerText = `>>> ${originalText} ${event.data.ville}`;
          (event.cellElement as HTMLElement).classList.add("underline-bold");
        }
        if (event.data.enCoursDateLimite)
          (
            event.cellElement as HTMLElement
          ).innerText += ` -> ${this.datePipe.transform(
            new Date(event.data.enCoursDateLimite)
          )}`;
        if (!event.data.valide)
          (event.cellElement as HTMLElement).classList.add("strike");
        if (event.data.code)
          event.cellElement.textContent =
            event.cellElement.textContent + " (" + event.data.code + ")";
      }
    }
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      e.rowElement.classList.add("cursor-pointer");
      e.rowElement.title = this.localizePipe.transform("hint-voir-encours");
      if (e.data.alerteCoface > 0 || e.data.enCours90Plus > 0)
        e.rowElement.classList.add("red-row");
    }
  }

  onRowDblClick(e) {
    this.client = {
      id: e.data.id,
      code: e.data.code,
      secteur: { id: e.data.secteur.id },
      devise: { id: e.data.devise.id },
      agrement: e.data.agrement,
      enCoursTemporaire: e.data.enCoursTemporaire,
      enCoursBlueWhale: e.data.enCoursBlueWhale,
    };
    this.encoursPopup.visible = true;
  }

  openOrder(ordre) {
    this.openEncoursOrder.emit(ordre);
  }
}
