import { Component, Input, Output, ViewChild } from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { CQLignesService } from "app/shared/services/api/cq-lignes.service";
import { GridConfiguratorService } from "app/shared/services/grid-configurator.service";
import * as gridConfig from "assets/configurations/grids.json";
import { GridColumn } from "basic";
import { DxButtonComponent, DxDataGridComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { environment } from "environments/environment";
import { alert, confirm } from "devextreme/ui/dialog";
import { ViewDocument } from "../../../shared/components/view-document-popup/view-document-popup.component";
import Document from "../../../shared/models/document.model";
import notify from "devextreme/ui/notify";
import { ToggledGrid } from "../form/form.component";
import { CqPhotosPopupComponent } from "./cq-photos-popup/cq-photos-popup.component";
import { DocumentsNumService } from "app/shared/services/api/documents-num.service";

@Component({
  selector: "app-grid-controle-qualite",
  templateUrl: "./grid-controle-qualite.component.html",
  styleUrls: ["./grid-controle-qualite.component.scss"],
})
export class GridControleQualiteComponent implements ToggledGrid {
  @Input() public ordre: Ordre;
  @Output() public ordreLigne;
  @ViewChild(DxDataGridComponent, { static: true }) dataGrid: DxDataGridComponent;
  @ViewChild(CqPhotosPopupComponent, { static: true }) photosPopup: CqPhotosPopupComponent;
  @ViewChild("copyPhotosButton", { static: false }) copyPhotosButton: DxButtonComponent;

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public detailedFields: GridColumn[];
  public gridRowsTotal: number;
  public reportVisible: boolean;
  public currentReport: ViewDocument;

  constructor(
    private cqLignesService: CQLignesService,
    public localization: LocalizationService,
    public documentsNumService: DocumentsNumService,
    public gridConfiguratorService: GridConfiguratorService,
    public localizeService: LocalizationService,
  ) {
    this.detailedFields = gridConfig["controle-qualite"].columns;
  }

  enableFilters() {
    if (this?.ordre?.id) {
      this.dataSource = this.cqLignesService.getDataSource_v2(
        this.detailedFields.map((property) => property.dataField),
      );
      this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      this.dataGrid.dataSource = this.dataSource;
    }
  }

  onContentReady(e) {

    this.gridRowsTotal = this.dataGrid.instance.getVisibleRows()?.length;

    // Counting photos per row and display corresponding text in the button
    this.dataGrid.instance.getVisibleRows()
      .forEach(c => {
        const button = document.getElementById("photo-button-" + c.key) as HTMLElement;
        this.documentsNumService.count(
          `ordreLigne.id==${c.data.ordreLigne.id} and typeDocument==CQPHO`
        ).subscribe(numb => {
          if (numb) {
            const toDisplay = (numb > 1) ? "photos-with-number" : "photo";
            button.querySelector(".dx-button-text").textContent =
              this.localization.localize(toDisplay).replace("&", numb.toString());
            button.classList.remove("visibility-hidden");
          }
        });
      });
  }

  onToggling(toggled: boolean) {
    toggled ? this.enableFilters() : (this.dataSource = null);
  }

  downloadPhotosClick() {
    this.documentsNumService.downloadPhotos(`numeroOrdre==${this.ordre.numero}`);
  }

  openPhotos(cell) {
    this.ordreLigne = cell.data.ordreLigne;
    this.photosPopup.visible = true;
  }

  openCQTechReport(titleKey: string, document: Document) {
    if (!document || !document.isPresent) {
      notify("Désolé, contrôle CQ technique non accessible", "error");
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
    this.documentsNumService.count(
      `ordreLigne.id==${cell.data.ordreLigne.id} and typeDocument=='CQXSL' and id==${cell.data.referenceCQC}`
    ).subscribe(report => {
      if (report) {
        confirm(
          this.localization.localize("text-popup-CQ-creation-PDF-existe"),
          this.localization.localize("text-popup-CQ-creation-PDF")
        ).then(res => {
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
                  notify("Erreur suppression ancien rapport CQ", "error", 7000);
                  console.log(err);
                }
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
      statut: 1
    };

    this.documentsNumService
      .save(documentNum, new Set(["ordreNumero", "typeDocument", "anneeCreation"]))
      .subscribe({
        next: () => {
          notify(
            this.localization.localize("text-popup-CQ-creation-PDF-deposee")
            , "success",
            3000);
        },
        error: (err) => {
          notify("Erreur création rapport CQ", "error", 7000);
          console.log(err);
        }
      });

  }

  openCQClientReport(cell) {
    console.log("open PDF");
    this.documentsNumService
      .getList(
        new Set(["nomFichierComplet", "statut"]),
        `ordreLigne.id==${cell.data.ordreLigne.id} and typeDocument=='CQXSL' and id==${cell.data.referenceCQC}`
      )
      .subscribe({
        next: (res) => {
          if (!res?.length) {
            notify("Aucun rapport CQ disponible", "warning", 3000);
          } else {
            let localText = "";
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
                break;
              }
              case 4: {
                localText = "text-popup-CQ-creation-PDF-erreur";
                break;
              }
            }
            // Show warning text
            if (localText) notify(this.localization.localize(localText), "warning", 3000);
          }
        },
        error: (err) => {
          notify("Erreur ouverture rapport CQ Client", "error", 7000);
          console.log(err);
        }
      });
  }

}

