import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import { ArticlesListComponent } from "app/pages/articles/list/articles-list.component";
import Ordre from "app/shared/models/ordre.model";
import { ArticlesService, LocalizationService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { CurrentCompanyService } from "app/shared/services/current-company.service";
import {
  Grid,
  GridConfiguratorService,
} from "app/shared/services/grid-configurator.service";
import {
  DxButtonComponent,
  DxPopupComponent,
  DxScrollViewComponent,
} from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { GridUtilsService } from "app/shared/services/grid-utils.service";
import { GridArticlesEdiColibriComponent } from "./grid-articles-edi-colibri/grid-articles-edi-colibri.component";

@Component({
  selector: 'app-gestion-articles-edi-colibri-popup',
  templateUrl: './gestion-articles-edi-colibri-popup.component.html',
  styleUrls: ['./gestion-articles-edi-colibri-popup.component.scss']
})
export class GestionArticlesEDICOLIBRIPopupComponent {
  @Input() public ordre: Ordre;
  @Output() public additionnalFilter: any;
  @Output() public lignesChanged = new EventEmitter();

  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: string[];
  ordreInfo = "";
  titleStart: string;
  titleMid: string;
  titleEnd: string;
  pulseBtnOn: boolean;
  remplacementArticle: boolean;
  popupFullscreen: boolean;

  @ViewChild(GridArticlesEdiColibriComponent, { static: false })
  gridArticlesEDI: GridArticlesEdiColibriComponent;
  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild("addButton", { static: false }) addButton: DxButtonComponent;
  @ViewChild("deleteButton", { static: false }) deleteButton: DxButtonComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;

  constructor(
    public OrdreLigneService: OrdreLignesService,
    private gridConfiguratorService: GridConfiguratorService,
    private functionsService: FunctionsService,
    private gridUtilsService: GridUtilsService,
    private currentCompanyService: CurrentCompanyService,
    private localizeService: LocalizationService
  ) { }


  setTitle() {
    this.titleStart = this.localizeService.localize("ordres-gestion-articles");
    this.titleMid = this.localizeService.localize("edi-colibri");
  }

  onShowing(e) {
    this.setTitle();
    e.component
      .content()
      .parentNode.classList.add("gestion-articles-edi-colibri-popup");
  }

  async onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    // datagrid state loading is not executed automatically in this component...
    const gridConfig = await this.gridConfiguratorService.fetchConfig(
      Grid.Article
    );
  }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }


  private messageFormat(mess) {
    const functionNames = ["ofInitArticle"];
    functionNames.map(
      (fn) =>
        (mess = mess.replace(`Exception while fetching data (/${fn}) : `, ""))
    );
    mess = mess.charAt(0).toUpperCase() + mess.slice(1);
    return mess;
  }
}
