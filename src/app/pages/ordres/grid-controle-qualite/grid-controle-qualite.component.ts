import { AfterViewInit, Component, Input, OnInit, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { AuthService, LocalizationService } from "app/shared/services";
import { CQLignesService } from "app/shared/services/api/cq-lignes.service";
import { DocumentsNumService } from "app/shared/services/api/documents-num.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxButtonComponent, DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { ViewDocument } from "../../../shared/components/view-document-popup/view-document-popup.component";
import Document from "../../../shared/models/document.model";
import { GridsService } from "../grids.service";
import { CqPhotosPopupComponent } from "./cq-photos-popup/cq-photos-popup.component";

@Component({
  selector: "app-grid-controle-qualite",
  templateUrl: "./grid-controle-qualite.component.html",
  styleUrls: ["./grid-controle-qualite.component.scss"],
})
export class GridControleQualiteComponent implements OnInit, AfterViewInit {
  @Input() public ordre: Ordre;
  @Output() public ordreLigne;
  @ViewChild(DxDataGridComponent, { static: true })
  dataGrid: DxDataGridComponent;
  @ViewChild(CqPhotosPopupComponent, { static: true })
  photosPopup: CqPhotosPopupComponent;
  @ViewChild("copyPhotosButton", { static: false })
  copyPhotosButton: DxButtonComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  public gridRowsTotal: number;
  public reportVisible: boolean;
  public currentReport: ViewDocument;

  constructor(
    private cqLignesService: CQLignesService,
    public authService: AuthService,
    public localization: LocalizationService,
    public gridsService: GridsService,
    public documentsNumService: DocumentsNumService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService
  ) {
    this.detailedFields = gridConfig["controle-qualite"].columns;
  }
  ngOnInit(): void {
    this.enableFilters();
  }

  ngAfterViewInit() {
    this.gridsService.register("CQ", this.dataGrid, this.gridsService.orderIdentifier(this.ordre));
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.cqLignesService.getDataSource_v2(
        this.detailedFields.map((property) => property.dataField)
      );
      this.dataSource.filter([
        ["ordre.id", "=", this.ordre.id],
        "and",
        ["evalue", "<>", false],
      ]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  onContentReady(e) {
    this.gridRowsTotal = this.dataGrid.instance.getVisibleRows()?.length;

    // Counting photos per row and display corresponding text in the button
    this.dataGrid.instance.getVisibleRows().forEach((c) => {
      const button = document.getElementById(
        "photo-button-" + c.key
      ) as HTMLElement;
      this.documentsNumService
        .count(`ordreLigne.id==${c.data.ordreLigne.id} and typeDocument==CQPHO`)
        .subscribe((numb) => {
          if (numb) {
            const toDisplay = numb > 1 ? "photos-with-number" : "photo";
            button.querySelector(".dx-button-text").textContent =
              this.localization
                .localize(toDisplay)
                .replace("&", numb.toString());
            button.classList.remove("visibility-hidden");
          }
        });
    });
  }

  onRowPrepared(e) {
    if (e.rowType === "data") {
      if (e.data.cq === "NON")
        e.rowElement.classList.add("yellow-datagrid-row");
    }
  }

  downloadPhotosClick() {
    this.documentsNumService.downloadPhotos(
      `numeroOrdre==${this.ordre.numero}`
    );
  }

  openPhotos(cell) {
    this.ordreLigne = cell.data.ordreLigne;
    this.photosPopup.visible = true;
  }

  openReport(titleKey: string, document: Document) {
    if (!document || !document.isPresent) {
      notify(
        `Désolé, ${this.localization.localize(titleKey)} non accessible`,
        "error",
        7000
      );
      return;
    }
    this.currentReport = {
      title: this.localization.localize(titleKey),
      document,
    };
    this.reportVisible = true;
  }

  onClickCreateCQClientReport(cell) {
    // Checks if QC report already exists
    this.documentsNumService
      .count(
        `ordreLigne.id==${cell.data.ordreLigne.id} and typeDocument=='CQXSL' and id==${cell.data.referenceCQC}`
      )
      .subscribe((report) => {
        if (report) {
          confirm(
            this.localization.localize("text-popup-CQ-creation-PDF-existe"),
            this.localization.localize("text-popup-CQ-creation-PDF")
          ).then((res) => {
            if (res) {
              this.documentsNumService
                .deleteByIdAndOrdreLigneAndTypeDocument(
                  cell.data.referenceCQC,
                  { id: cell.data.ordreLigne.id },
                  "CQXSL"
                )
                .subscribe({
                  next: () => {
                    this.createCQClientReport(cell.data);
                  },
                  error: (err) => {
                    notify(
                      "Erreur suppression ancien rapport CQ",
                      "error",
                      7000
                    );
                    console.log(err);
                  },
                });
            }
          });
        } else {
          this.createCQClientReport(cell.data);
        }
      });
  }

  createCQClientReport(data) {
    const d = new Date();

    const documentNum = {
      id: data.referenceCQC,
      numeroOrdre: data.ordreLigne.ordre.numero,
      ordreLigne: { id: data.ordreLigne.id },
      typeDocument: "CQXSL",
      anneeCreation: d.getFullYear().toString(),
      moisCreation: ("0" + (d.getMonth() + 1)).slice(-2),
      flagPDF: false,
      statut: 1,
    };

    this.documentsNumService
      .save(
        documentNum,
        new Set(["ordreNumero", "typeDocument", "anneeCreation"])
      )
      .subscribe({
        next: () => {
          notify(
            this.localization.localize("text-popup-CQ-creation-PDF-deposee"),
            "success",
            3000
          );
        },
        error: (err) => {
          notify("Erreur création rapport CQ", "error", 7000);
          console.log(err);
        },
      });
  }

  openCQClientReport(cell) {
    this.documentsNumService
      .getList(
        new Set(["statut", "cqDocPath", "cqDoc.isPresent", "cqDoc.uri", "cqDoc.type"]),
        `ordreLigne.id==${cell.data.ordreLigne.id} and typeDocument=='CQXSL' and id==${cell.data.referenceCQC}`
      )
      .subscribe({
        next: (res) => {
          if (!res?.length) {
            notify("Aucun rapport CQ disponible", "warning", 3000);
          } else {
            let localText = "";
            let toastType = "warning";

            switch (res[0].statut) {
              case 1: {
                localText = "text-popup-CQ-creation-PDF-attente";
                break;
              }
              case 2: {
                localText = "text-popup-CQ-creation-PDF-generation";
                break;
              }
              case 3: {
                // Opening PDF
                localText = "text-popup-CQ-ouverture-PDF";
                toastType = "info";
                const document = {
                  isPresent: res[0].cqDoc.isPresent,
                  uri: res[0].cqDoc.uri,
                  type: res[0].cqDoc.type,
                };
                this.openReport("ControleQualite-cqClient", document);
                break;
              }
              case 4: {
                localText = "text-popup-CQ-creation-PDF-erreur";
                toastType = "error";
                break;
              }
            }
            // Show info/warning text
            if (localText)
              notify(this.localization.localize(localText), toastType, 3000);
          }
        },
        error: (err) => {
          notify("Erreur ouverture rapport CQ Client", "error", 7000);
          console.log(err);
        },
      });
  }
}
