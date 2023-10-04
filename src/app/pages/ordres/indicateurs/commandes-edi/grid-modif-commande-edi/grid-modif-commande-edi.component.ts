import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { CommandeEdi, MaskModif } from "app/shared/models/commande-edi.model";
import { statusGEO } from "app/shared/models/edi-ordre.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { OrdresEdiService } from "app/shared/services/api/ordres-edi.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { GridsService } from "../../../grids.service";
import { alert } from "devextreme/ui/dialog";
import {
  Grid,
  GridConfig,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import { GridColumn } from "basic";
import { DxDataGridComponent } from "devextreme-angular";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TabContext } from "../../../root/root.component";
import { OrdresService } from "app/shared/services/api/ordres.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";

const ALL = "%";
const DATEFORMAT = "dd/MM/yyyy HH:mm:ss";

@Component({
  selector: "app-grid-modif-commande-edi",
  templateUrl: "./grid-modif-commande-edi.component.html",
  styleUrls: ["./grid-modif-commande-edi.component.scss"],
})
export class GridModifCommandeEdiComponent {
  public readonly env = environment;

  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public ediLigneIdSelected;


  @Input() ordreEdiId: string;
  @Input() ordreId: string;
  @Output() commandeEdi: Partial<CommandeEdi>;
  @Output() clotureOrdreEdi = new EventEmitter();

  @ViewChild(DxDataGridComponent) public datagrid: DxDataGridComponent;

  constructor(
    public gridConfiguratorService: GridConfiguratorService,
    private ordresEdiService: OrdresEdiService,
    private ordreLignesService: OrdreLignesService,
    private ordresService: OrdresService,
    public tabContext: TabContext,
    private dateMgtService: DateManagementService,
    public gridsService: GridsService,
    public localization: LocalizationService,
    public authService: AuthService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.ModifCommandeEdi
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
    this.columns.pipe(
      map((columns) => columns.map((column) => column.dataField))
    );
  }

  enableFilters() {

    const requiredFields = [
      "id",
      "eanProduitClient",
      "eanProduitBw",
      "eanColisClient",
      "eanColisBw",
      "operationMarketing",
      "fichierSource",
      "libelleProduit",
      "listArticleId",
      "masqueLigne",
      "masqueOrdre",
      "numeroLigne",
      "parCombien",
      "quantite",
      "prixVente",
      "quantiteColis",
      "refCmdClient",
      "status",
      "statusGeo",
      "typeColis",
      "uniteQtt",
      "version",
      "refEdiOrdre",
      "dateDocument",
      "dateLivraison",
      "client.id",
      "client.code",
      "client.raisonSocial",
      "entrepot.id",
      "entrepot.code",
      "entrepot.raisonSocial",
      "ordre.id",
      "ordre.numero",
      "ordre.campagne.id",
      "ordreId",
      "refEdiLigne"
    ];

    this.datagrid.dataSource = null;
    this.datagrid.instance.beginCustomLoading("");
    this.ordresEdiService
      .allCommandeEdi(
        this.ordreEdiId,
        this.authService.currentUser.secteurCommercial.id,
        ALL,
        ALL,
        ALL,
        ALL,
        ALL,
        new Date(1980, 1, 1),
        new Date(2100, 1, 1),
        'livraison',
        requiredFields
      )
      .subscribe((res) => {
        this.datagrid.dataSource = res.data.allCommandeEdi;
        this.datagrid.instance.option("focusedRowIndex", 0); // Focus on group row
        this.datagrid.instance.refresh();
        this.datagrid.instance.endCustomLoading();
      });
  }

  onFocusedRowChanged(e) {
    this.ediLigneIdSelected = e.row?.data?.refEdiLigne;
  }

  onCellPrepared(e) {
    const field = e.column.dataField;

    if (e.rowType === "group") {
      if (field === "refEdiOrdre" && e.cellElement.textContent) {
        let data = e.data.items ?? e.data.collapsedItems;
        data = data[0];

        // Add special background color to the group row
        e.cellElement.parentElement.classList.add("group-back-color");

        // Fill left text of the group row
        // ref cmd clt - raison soc clt - raison soc entrep - Version date - Livraison
        let leftTextContent =
          data.refCmdClient + " - " + (data.client.raisonSocial ?? "");
        if (data.entrepot?.raisonSocial)
          leftTextContent += " / " + data.entrepot.raisonSocial + " ";
        leftTextContent += " - Version " + (data.version ?? "");
        e.cellElement.childNodes[0].children[1].innerText = leftTextContent;

        // Fill right text of the group row
        e.cellElement.childNodes[0].children[2].innerText =
          "Livraison : " +
          this.dateMgtService.formatDate(data.dateLivraison, DATEFORMAT) ??
          "";

        // Fill indicator button text and sets its bck depending on the status
        e.cellElement.childNodes[0].children[0].innerHTML = data.status;
        e.cellElement.childNodes[0].children[0].classList.add(
          `info-${data.status}`
        );
      }
    }
    if (e.rowType === "data") {
      if (field === "status") {
        e.cellElement.classList.add(`info-${e.data.status}`);
        e.cellElement.classList.add("white-text");
      }
      // Tooltip Descript. article
      if (field === "libelleProduit")
        e.cellElement.title = e.data.libelleProduit ?? "";

      // Identify modified fields vs mask e.g. "000000001", See MaskModif for details
      if (e.data.masqueLigne) {
        e.data.masqueLigne.split("").map((item, index) => {
          if (MaskModif[field] === index + 1 && item === "1")
            e.cellElement.classList.add("red-font");
        });
      }
      // Identify ope marketing prices
      if (e.data.operationMarketing === "PRP" && field === "prixVente")
        e.cellElement.classList.add("green-font");
    }
    if (e.rowType === "header") {
      // Change first column header text status => modif
      if (field === "status")
        e.cellElement.innerHTML = this.localization.localize("ordresEdi-modif");
      if (field === "status")
        e.cellElement.innerHTML = this.localization.localize("ordresEdi-modif");
    }
  }

  onEdiCellClick(e) {
    if (e.rowType !== "data" || !e?.data) return;
    const dataSource = this.ordreLignesService.getDataSource_v2(["ediLigne.id", "ordre.numero", "ordre.campagne.id"]);
    dataSource.filter(["ediLigne.id", "=", e.data.refEdiLigne]);
    dataSource.load().then(res => {
      if (res?.length) {
        this.tabContext.openOrdre(
          res[0].ordre.numero,
          res[0].ordre.campagne.id,
          true,
          this.localization.localize("acces-ordre")
        );
      } else {
        notify(this.localization.localize("ordre-not-found"), "warning", 1500);
      }
    });
  }

  onCompleteOrderEdiClick() {
    // Sauvegarde of_sauve_ordre
    this.ordresService.ofSauveOrdre(this.ordreId).subscribe({
      error: (error: Error) => {
        alert(
          this.messageFormat(error.message),
          this.localization.localize("ordre-cloture-ordre-edi")
        );
      },
    });

    // Sauvegarde Statut ordre EDI
    const ediOrdre = { id: this.ordreEdiId, statusGEO: statusGEO.Traité };
    this.ordresEdiService.save_v2(["id", "statusGEO"], { ediOrdre }).subscribe({
      next: () => {
        this.clotureOrdreEdi.emit();
        notify(
          this.localization.localize("ordre-edi-cloture"),
          "success",
          7000
        );
      },
      error: (err) => {
        notify("Erreur sauvegarde statut Geo ordre EDI", "error", 3000);
        console.log(err);
      },
    });
  }

  private messageFormat(mess) {
    mess = mess.replace("Exception while fetching data (/ofSauveOrdre) : ", "");
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}

export default GridModifCommandeEdiComponent;
