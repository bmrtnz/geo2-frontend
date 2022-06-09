import {
  Component,
  Input,
  NgModule,
  OnChanges,
  SimpleChanges, ViewChild,
} from "@angular/core";

import {
    FileManagerService,
    FileItem,
} from "app/shared/services/file-manager.service";
import {DxFileManagerComponent, DxFileManagerModule, DxPopupModule} from "devextreme-angular";
import { CommonModule } from "@angular/common";
import CustomFileSystemProvider from "devextreme/file_management/custom_provider";
import { SharedModule } from "../../shared.module";
import {AuthService} from "../../services";

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

    @ViewChild(DxFileManagerComponent, { static: false })
    fileManager: DxFileManagerComponent;

    visible = false;
    userAdmin = false;
    fileProvider: CustomFileSystemProvider;
    items: any;

    constructor(public fileManagerService: FileManagerService, private authService: AuthService) {
        this.items = [
            "showNavPane",
            "create",
            { name: "upload", text: "after" },
            "switchView",
            { name: "separator", location: "after" },
            "refresh",
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        const key = changes.key ? changes.key.currentValue : this.key;

        this.userAdmin = this.authService.currentUser.adminClient;
        this.fileProvider = this.fileManagerService.getProvider(
            key,
            changes.id.currentValue,
        );

        // If not the first time, set currentPath to "/"
        if (this.fileManager) {
          this.fileManager.instance.option("currentPath", "");
        }
    }
}

@NgModule({
    imports: [CommonModule, DxFileManagerModule, DxPopupModule, SharedModule],
    declarations: [FileManagerComponent],
    exports: [FileManagerComponent],
})
export class FileManagerModule {}
