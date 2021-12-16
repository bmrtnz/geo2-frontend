import {Component, Input, NgModule, OnChanges, SimpleChanges} from '@angular/core';

import {FileManagerService, FileItem} from 'app/shared/services/file-manager.service';
import {DxFileManagerModule, DxPopupModule} from 'devextreme-angular';
import {CommonModule} from '@angular/common';
import CustomFileSystemProvider from 'devextreme/file_management/custom_provider';
import {SharedModule} from '../../shared.module';


@Component({
  selector: 'app-file-manager-popup',
  templateUrl: './file-manager-popup.component.html',
  styleUrls: ['./file-manager-popup.component.scss'],
  providers: [FileManagerService]
})

export class FileManagerComponent implements OnChanges {

  @Input() key: string;

  @Input() id: any;

  visible = false;
  fileProvider: CustomFileSystemProvider;
  items: any;

  constructor(
    public fileManagerService: FileManagerService
  ) {
    this.items =
    [ 'showNavPane', 'create', { name: 'upload', text: 'after' }, 'switchView', { name: 'separator', location: 'after' }, 'refresh' ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    const key = changes.key ? changes.key.currentValue : this.key;

    this.fileProvider = this.fileManagerService.getProvider(key, changes.id.currentValue);
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxFileManagerModule,
    DxPopupModule,
    SharedModule
  ],
  declarations: [FileManagerComponent],
  exports: [FileManagerComponent]
})

export class FileManagerModule { }

