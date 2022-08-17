import { AfterViewInit, Component, Input, OnChanges, OnInit, Output, ViewChild } from "@angular/core";
import CommandeEdi from "app/shared/models/commande-edi.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { OrdresEdiService } from "app/shared/services/api/ordres-edi.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import {
  Grid, GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../../root/root.component";

const ALL = "%";
const DATEFORMAT = "dd/MM/yyyy HH:mm:ss";

@Component({
  selector: "app-grid-modif-commande-edi",
  templateUrl: "./grid-modif-commande-edi.component.html",
  styleUrls: ["./grid-modif-commande-edi.component.scss"]
})
export class GridModifCommandeEdiComponent implements OnInit, OnChanges, AfterViewInit {
  public readonly env = environment;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public gridTitle: string;
  toRefresh: boolean;

  @Input() ordreEdiId: string;
  @Output() commandeEDI: Partial<CommandeEdi>;

  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private ordresEdiService: OrdresEdiService,
    public tabContext: TabContext,
    private dateMgtService: DateManagementService,
    private localization: LocalizationService,
    public authService: AuthService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.ModifCommandeEdi,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
    this.gridTitle = "";

  }

  async ngOnInit() {
    this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField)),
    );
  }

  ngOnChanges() {
    if (this.ordreEdiId) this.enableFilters();
  }

  ngAfterViewInit() {
  }

  enableFilters() {

    this.datagrid.dataSource = null;
    this.datagrid.instance.beginCustomLoading("");
    this.ordresEdiService.allCommandeEdi(
      this.ordreEdiId,
      this.authService.currentUser.secteurCommercial.id,
      ALL,
      ALL,
      ALL,
      ALL,
      new Date(1980, 1, 1),
      new Date(2100, 1, 1),
    ).subscribe((res) => {
      this.datagrid.dataSource = res.data.allCommandeEdi;
      this.datagrid.instance.refresh();
      this.datagrid.instance.endCustomLoading();
    });

  }

  onCellPrepared(e) {
    const field = e.column.dataField;

    if (e.rowType === "group") {
      if (field === "refEdiOrdre" && e.cellElement.textContent) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];

        // Add special background color to the group row
        e.cellElement.parentElement.classList.add("group-back-color");

        // Show ref cmd clt - raison soc clt - Version date - Livraison
        // Fill left text of the group row
        let leftTextContent =
          data.refCmdClient + " - " +
          (data.client.raisonSocial ?? "");
        if (data.entrepot?.code) leftTextContent += " - " + data.entrepot.code + " ";
        if (data.entrepot?.raisonSocial) leftTextContent += " / " + data.entrepot.raisonSocial + " ";
        leftTextContent += " - Version " + (data.version ?? "");
        e.cellElement.childNodes[0].children[1].innerText = leftTextContent;

        // Fill right text of the group row
        e.cellElement.childNodes[0].children[2].innerText =
          "Livraison : " + this.dateMgtService.formatDate(data.dateLivraison, DATEFORMAT) ?? "";

        // Fill indicator button text and sets its bck depending on the status
        e.cellElement.childNodes[0].children[0].innerHTML = data.status;
        e.cellElement.childNodes[0].children[0].classList.add(`info-${data.status}`);
      }
    }
    if (e.rowType === "data") {
      if (field === "status") {
        e.cellElement.classList.add(`info-${e.data.status}`);
        e.cellElement.classList.add("white-text");
      }

      if (field === "libelleProduit") {
        // Infobulle Descript. article
        e.cellElement.title = e.data.libelleProduit;
      }
    }
    if (e.rowType === "header") {
      // Change first column header text status => modif
      if (field === "status") e.cellElement.innerHTML = this.localization.localize("ordresEDI-modif");
    }

  }

  onCellClick(e) {
    if (!e?.data) return;
    console.log(this.tabContext);
    this.tabContext.openOrdre(e.data.ordre.numero, e.data.ordre.campagne.id);
  }

}

export default GridModifCommandeEdiComponent;
