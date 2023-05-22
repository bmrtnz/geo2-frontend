import {
  Component,
  Input,
  OnChanges,
  ViewChild
} from "@angular/core";
import { PromptPopupComponent } from "app/shared/components/prompt-popup/prompt-popup.component";
import { AuthService } from "app/shared/services";
import { DocumentsNumService } from "app/shared/services/api/documents-num.service";
import { HistoriqueLogistiqueService } from "app/shared/services/api/historique-logistique.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import {
  Grid,
  GridConfig,
  GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxTextBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-cq-photos",
  templateUrl: "./grid-cq-photos.component.html",
  styleUrls: ["./grid-cq-photos.component.scss"],
})
export class GridCqPhotosComponent implements OnChanges {
  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public items: any[];
  public currentData: any;
  public gridFields: any;
  public currentImgPath: string;
  public currentImgComment: string;

  @Input() public ordreLigneId: string;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("path", { static: false }) path: DxTextBoxComponent;
  @ViewChild(PromptPopupComponent) promptPopup: PromptPopupComponent;

  constructor(
    public ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
    public documentsNumService: DocumentsNumService,
    public gridUtilsService: GridUtilsService,
    public localization: LocalizationService,
    public historiqueModificationsDetailService: HistoriqueModificationsDetailService,
    public authService: AuthService,
    public formUtilsService: FormUtilsService,
    public historiqueLogistiqueService: HistoriqueLogistiqueService,
    public localizeService: LocalizationService
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PhotosControleQualite
    );
    this.columns = from(this.gridConfig).pipe(map((config) => config.columns));
  }

  ngOnChanges() {
    this.currentImgComment = "";
    this.currentImgPath = "";
    this.enableFilters();
  }

  async enableFilters() {
    if (this?.ordreLigneId) {
      const fields = this.columns.pipe(
        map((cols) =>
          cols.map((column) => {
            return column.dataField;
          })
        )
      );
      this.gridFields = await fields.toPromise();
      const dataSource = this.documentsNumService.getDataSource(
        new Set(this.gridFields)
      );
      dataSource.filter([
        ["ordreLigne.id", "=", this.ordreLigneId],
        "and",
        ["typeDocument", "=", "CQPHO"],
      ]);
      this.datagrid.dataSource = dataSource;
    }
  }

  public refreshGrid() {
    this.datagrid.instance.refresh();
  }

  onCellClick(e) {
    if (!e.data) return;
    this.currentData = e.data;
  }

  onFocusedRowChanged(e) {
    if (!e.row?.data) return;
    if (e.row.data.cqDoc.isPresent) {
      const targetURL = new URL(e.row.data.cqDoc.uri, environment.apiEndpoint);
      this.currentImgPath = targetURL.href;
    }
    else this.currentImgPath = "assets/images/BW-couleur-blanc.png";
    this.currentImgComment = e.row.data.commentaire;
  }

  downloadAllPhotos() {
    this.documentsNumService.downloadPhotos(
      `ordreLigne.id==${this.ordreLigneId}`
    );
  }

  downloadPhoto(cell) {
    this.documentsNumService.downloadPhotos(
      `ordreNumero==${cell.data.ordreNumero}`
    );
  }

  commentPhoto() {
    this.promptPopup.show({ commentMaxLength: 255 });
  }

  saveComment(comment) {
    const documentNum = {
      ordreNumero: this.currentData.ordreNumero,
      typeDocument: this.currentData.typeDocument,
      anneeCreation: this.currentData.anneeCreation,
      commentaire: comment,
    };

    this.documentsNumService
      .save(documentNum, new Set(this.gridFields))
      .subscribe({
        next: () => {
          this.refreshGrid();
          this.currentImgComment = comment;
          notify("Commentaire mis à jour", "success", 2000);
        },
        error: (err) => {
          notify("Erreur sauvegarde commentaire", "error", 7000);
          console.log(err);
        },
      });
  }
}
