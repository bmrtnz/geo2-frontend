import {
  AfterViewInit,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { PromptPopupComponent } from "app/shared/components/prompt-popup/prompt-popup.component";
import { AuthService } from "app/shared/services";
import { DocumentsNumService } from "app/shared/services/api/documents-num.service";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { HistoriqueLogistiqueService } from "app/shared/services/api/historique-logistique.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
import { alert, confirm } from "devextreme/ui/dialog";
import { FormUtilsService } from "app/shared/services/form-utils.service";
import {
  Grid,
  GridConfig, GridConfiguratorService
} from "app/shared/services/grid-configurator.service";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { LocalizationService } from "app/shared/services/localization.service";
import { GridColumn } from "basic";
import { DxDataGridComponent, DxTextBoxComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import notify from "devextreme/ui/notify";
import { environment } from "environments/environment";
import { from, Observable, PartialObserver } from "rxjs";
import { map } from "rxjs/operators";

@Component({
  selector: "app-grid-cq-photos",
  templateUrl: "./grid-cq-photos.component.html",
  styleUrls: ["./grid-cq-photos.component.scss"]
})
export class GridCqPhotosComponent implements OnChanges, AfterViewInit {

  public dataSource: DataSource;
  public columnChooser = environment.columnChooser;
  public columns: Observable<GridColumn[]>;
  private gridConfig: Promise<GridConfig>;
  public env = environment;
  public items: any[];
  public currentData: any;
  public gridFields: any;
  public currentImgPath: string;

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
    public localizeService: LocalizationService,
  ) {
    this.gridConfig = this.gridConfiguratorService.fetchDefaultConfig(
      Grid.PhotosControleQualite,
    );
    this.columns = from(this.gridConfig).pipe(
      map((config) => config.columns),
    );
  }

  ngOnChanges() {
    this.enableFilters();
  }

  ngAfterViewInit() {
  }

  async enableFilters() {
    if (this?.ordreLigneId) {
      const fields = this.columns.pipe(map(cols => cols.map(column => {
        return column.dataField;
      })));
      this.gridFields = await fields.toPromise();
      const dataSource = this.documentsNumService.getDataSource(new Set(this.gridFields));
      dataSource.filter(["ordreLigne.id", "=", this.ordreLigneId]);
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
    this.currentImgPath = e.row.data.nomFichierComplet;
  }

  downloadAllPhotos() {
    console.log("downloadAllPhotos");
    // this.documentsNumService.downloadPhotos(`numeroOrdre==${monNumeroOrdre}`)
  }

  downloadPhoto(cell) {
    console.log("downloadPhoto");
    // console.log(this.documentsNumService.downloadPhotos(`ordreLigne.id=="807A7B"`));
  }

  commentPhoto() {
    this.promptPopup.show({ commentMaxLength: 255 });
  }

  saveComment(comment) {
    const documentNum = this.currentData;
    documentNum.commentaire = comment;
    documentNum.ordreLigne = { id: documentNum.ordreLigne.id };
    this.documentsNumService
      .save(documentNum, new Set(this.gridFields))
      .subscribe({
        next: () => {
          notify("Commentaire mis à jour", "success", 7000);
        },
        error: (err) => {
          notify("Erreur sauvegarde commentaire", "error", 7000);
          console.log(err);
        }
      });

  }

}
