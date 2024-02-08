import {
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from "@angular/core";

import {
  FileManagerService,
  FileItem,
} from "app/shared/services/file-manager.service";
import {
  DxFileManagerComponent,
  DxFileManagerModule,
  DxButtonModule,
  DxPopupModule,
  DxScrollViewModule,
  DxPopupComponent,
  DxScrollViewComponent
} from "devextreme-angular";
import { CommonModule } from "@angular/common";
import CustomFileSystemProvider from "devextreme/file_management/custom_provider";
import { SharedModule } from "../../shared.module";
import { AuthService, LocalizationService } from "../../services";
import { TopRightPopupButtonsModule } from "../top-right-popup-buttons/top-right-popup-buttons.component";

@Component({
  selector: "app-file-manager-popup",
  templateUrl: "./file-manager-popup.component.html",
  styleUrls: ["./file-manager-popup.component.scss"],
  providers: [FileManagerService],
})
export class FileManagerComponent implements OnChanges {
  @Input() key: string;

  @Input() id: any;

  @Input() subTitle: string;

  @ViewChild(DxPopupComponent, { static: false }) popup: DxPopupComponent;
  @ViewChild(DxFileManagerComponent, { static: false }) fileManager: DxFileManagerComponent;
  @ViewChild(DxScrollViewComponent, { static: false }) dxScrollView: DxScrollViewComponent;

  public visible = false;
  public userAdmin = false;
  public fileProvider: CustomFileSystemProvider;
  public items: any;
  public popupFullscreen: boolean;
  public titleStart: string;
  public titleMid: string;
  public titleEnd: string;

  constructor(
    public fileManagerService: FileManagerService,
    private authService: AuthService,
    public localizeService: LocalizationService
  ) {
    this.items = [
      "showNavPane",
      "create",
      { name: "upload", text: "after" },
      "switchView",
      { name: "separator", location: "after" },
      "refresh",
    ];
  }

  ngOnChanges() {
    if (this.dxScrollView) this.dxScrollView.instance.scrollTo(0);
    this.setTitle();
  }

  setTitle() {
    this.titleStart = this.localizeService.localize("documents");
    this.titleMid = (this.subTitle ? ' - ' : '');
    this.titleEnd = (this.subTitle ?? '');
  }

  onShowing(e) {

    e.component.content().parentNode.classList.add("file-manager-popup");

    this.fileProvider = this.fileManagerService.getProvider(this.key, this.id);

    this.userAdmin = this.authService.currentUser.adminClient;
    // If not the first time, set currentPath to "/"
    if (this.fileManager) {
      this.fileManager.instance.option("currentPath", "");
    }
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   console.log(changes);
  //   const key = changes.key ? changes.key.currentValue : this.key;

  //   this.userAdmin = this.authService.currentUser.adminClient;
  //   this.fileProvider = this.fileManagerService.getProvider(
  //     key,
  //     changes.id.currentValue,
  //   );

  //   // If not the first time, set currentPath to "/"
  //   if (this.fileManager) {
  //     this.fileManager.instance.option("currentPath", "");
  //   }
  // }

  hidePopup() {
    this.popup.visible = false;
  }

  resizePopup() {
    this.popupFullscreen = !this.popupFullscreen;
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxFileManagerModule,
    DxPopupModule,
    SharedModule,
    DxButtonModule,
    DxScrollViewModule,
    TopRightPopupButtonsModule
  ],
  declarations: [FileManagerComponent],
  exports: [FileManagerComponent],
})
export class FileManagerModule { }
