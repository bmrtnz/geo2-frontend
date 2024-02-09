import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ViewChild,
} from "@angular/core";
import Ordre from "app/shared/models/ordre.model";
import { LocalizationService } from "app/shared/services";
import { OrdreLignesService } from "app/shared/services/api/ordres-lignes.service";
import { DxPopupComponent, DxScrollViewComponent } from "devextreme-angular";
import DataSource from "devextreme/data/data_source";
import { confirm } from "devextreme/ui/dialog";
import { GridLignesGroupageChargementsComponent } from "./grid-lignes-groupage-chargements/grid-lignes-groupage-chargements.component";

@Component({
  selector: "app-groupage-chargements-popup",
  templateUrl: "./groupage-chargements-popup.component.html",
  styleUrls: ["./groupage-chargements-popup.component.scss"],
})
export class GroupageChargementsPopupComponent implements OnChanges {
  @Input() public ordre: Ordre;
  @Input() public gridCommandes: any;
  @Input() public gridEnvois: any;
  @Input() public allowMutations: boolean;
  @Output() public readOnlyGrid: boolean;
  @Output() public gridCdes: any;
  @Output() public gridEnv: any;
  @Output() lignesChanged = new EventEmitter();
  @Output() ordreChanged = new EventEmitter();
  @Output() public whenDone = new EventEmitter();


  visible: boolean;
  idArticlesDS: DataSource;
  codeChangeProcess: boolean;
  articlesKO = true;
  validBtnText: string;
  nbARticles: number;
  nbArticlesOld: number;
  chosenArticles: string[];
  ordreInfo = "";
  title: string;
  pulseBtnOn: boolean;
  remplacementArticle: boolean;
  popupFullscreen = false;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxScrollViewComponent, { static: false })
  dxScrollView: DxScrollViewComponent;
  @ViewChild(GridLignesGroupageChargementsComponent, { static: false })
  gridComponent: GridLignesGroupageChargementsComponent;

  constructor(
    public OrdreLigneService: OrdreLignesService,
    private localizeService: LocalizationService
  ) { }

  ngOnChanges() {
    this.setTitle();
    this.gridCdes = this.gridCommandes;
    this.gridEnv = this.gridEnvois;
    this.readOnlyGrid = !this.allowMutations;
  }

  setTitle() {
    this.title = this.localizeService.localize("groupage-chargements");
  }

  onShowing(e) {
    e.component
      .content()
      .parentNode.classList.add("groupage-chargements-popup");
  }

  onShown(e) {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    if (this.ordre) this.gridComponent.enableFilters();
  }

  onHidden(e) {
    this.gridComponent.datagrid.instance.cancelEditData();
    this.gridComponent.datagrid.dataSource = null;
  }

  closePopup() {
    if (this.gridComponent.datagrid.instance.hasEditData()) {
      confirm(
        this.localizeService.localize("text-popup-quit-unsaved-elements"),
        this.localizeService.localize("groupage-chargements")
      ).then((res) => {
        if (res) this.hidePopup();
      });
    } else {
      this.hidePopup();
    }
  }

  hidePopup() {
    this.popup.visible = false;
  }

  updateGridCde() {
    this.lignesChanged.emit();
  }

  updateOrder() {
    this.ordreChanged.emit();
  }
}
