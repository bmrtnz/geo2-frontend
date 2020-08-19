import {Component, NgModule} from '@angular/core';

import {FileManagerService, FileItem} from 'app/shared/services/file-manager.service';
import {DxFileManagerModule, DxPopupModule} from 'devextreme-angular';
import {CommonModule} from '@angular/common';


@Component({
  selector: 'app-file-manager-popup',
  templateUrl: './file-manager-popup.component.html',
  styleUrls: ['./file-manager-popup.component.scss'],
  providers: [FileManagerService]
})

export class FileManagerComponent {

  visible = false;
  fileItems: FileItem[];

  constructor(
    public fileManagerService: FileManagerService
  ) {
    this.fileItems = fileManagerService.getFileItems();
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxFileManagerModule,
    DxPopupModule
  ],
  declarations: [FileManagerComponent],
  exports: [FileManagerComponent]
})

export class FileManagerModule { }

