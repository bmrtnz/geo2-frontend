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
import { FunctionsService } from "app/shared/services/api/functions.service";
import { HistoriqueLogistiqueService } from "app/shared/services/api/historique-logistique.service";
import { HistoriqueModificationsDetailService } from "app/shared/services/api/historique-modifs-detail.service";
import { OrdresLogistiquesService } from "app/shared/services/api/ordres-logistiques.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import { DateManagementService } from "app/shared/services/date-management.service";
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
  public currentId: string;
  @Input() public ordreLigneId: string;
  @ViewChild(DxDataGridComponent) private datagrid: DxDataGridComponent;
  @ViewChild("path", { static: false }) path: DxTextBoxComponent;
  @ViewChild(PromptPopupComponent) promptPopup: PromptPopupComponent;

  constructor(
    public ordresLogistiquesService: OrdresLogistiquesService,
    public gridConfiguratorService: GridConfiguratorService,
    public dateManagementService: DateManagementService,
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
      // const fields = this.columns.pipe(
      //   map((columns) => columns.map((column) => column.dataField)),
      // );
      this.items = [
        { id: "1", nomFichier: "cqpho_033517_20170414_913277_85519B_002.JPG", ficheCQ: false },
        { id: "2", nomFichier: "cqpho_033517_20170414_913277_85519B_003.JPG", ficheCQ: false },
      ];
      // this.dataSource = this.ordresLogistiquesService.getDataSource_v2(
      //   await fields.toPromise(),
      // );
      // this.dataSource.filter([["ordre.id", "=", this.ordre.id]]);
      // this.datagrid.dataSource = this.dataSource;
      // this.gridUtilsService.resetGridScrollBar(this.datagrid);
    } else if (this.datagrid) this.datagrid.dataSource = null;
  }

  onCellPrepared(e) {
  }

  public refreshGrid() {
    this.datagrid.instance.refresh();
  }

  onCellClick(e) {
    if (!e.data) return;
    this.currentId = e.data.id;
  }

  copyAllPhotos() {
    console.log("copyAllPhotos");
  }

  copyPhoto(cell) {
    console.log("copyPhoto");
  }

  commentPhoto() {
    this.promptPopup.show({ commentMaxLength: 255 });
  }

  saveComment(comment) {
    // Implémenter la sauvegarde du commentaire
    // Geo1 : GEO_DOCNUM"."COMMENTAIRE" saisie libre (255 caractères max)
    // Avec this.currentId comme id de ligne
  }

}
