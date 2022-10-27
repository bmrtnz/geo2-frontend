import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import CustomFileSystemProvider from "devextreme/file_management/custom_provider";
import FileSystemItem from "devextreme/file_management/file_system_item";
import UploadInfo from "devextreme/file_management/upload_info";
import Guid from "devextreme/core/guid";
import { environment } from "../../../environments/environment";

export class FileItem {
  name: string;
  isDirectory: boolean;
  size?: number;
  items?: FileItem[];
}

const fileItems: FileItem[] = [
  {
    name: "Documents",
    isDirectory: true,
    items: [
      {
        name: "Projets",
        isDirectory: true,
        items: [
          {
            name: "A propos.rtf",
            isDirectory: false,
            size: 1024,
          },
          {
            name: "Mots de passe.rtf",
            isDirectory: false,
            size: 2048,
          },
        ],
      },
      {
        name: "A propos.xml",
        isDirectory: false,
        size: 1024,
      },
      {
        name: "Managers.rtf",
        isDirectory: false,
        size: 2048,
      },
      {
        name: "A faire.txt",
        isDirectory: false,
        size: 3072,
      },
    ],
  },
  {
    name: "Images",
    isDirectory: true,
    items: [
      {
        name: "logo.png",
        isDirectory: false,
        size: 20480,
      },
      {
        name: "banniere.gif",
        isDirectory: false,
        size: 10240,
      },
    ],
  },
  {
    name: "Système",
    isDirectory: true,
    items: [
      {
        name: "Employés.txt",
        isDirectory: false,
        size: 3072,
      },
      {
        name: "Liste mots de passe.txt",
        isDirectory: false,
        size: 5120,
      },
    ],
  },
  {
    name: "Description.rtf",
    isDirectory: false,
    size: 1024,
  },
  {
    name: "Description.txt",
    isDirectory: false,
    size: 2048,
  },
];

interface BaseArgs {
  key: string;
  id: string;
}

@Injectable({
  providedIn: "root"
})
export class FileManagerService {
  private baseArgs: BaseArgs;

  constructor(private httpClient: HttpClient) { }

  /**
   * Build file action url.
   *
   * @param command Command to execute.
   */
  private static _buildUrl(command: string): string {
    return `${environment.apiEndpoint}/file-manager/execute/${command}`;
  }

  /**
   * Create and append hidden input to given form.
   */
  private static _formAppendInput(form, name, value) {
    const input = document.createElement("input");

    input.type = "hidden";
    input.name = name;
    input.value = value;

    form.appendChild(input);
  }

  /**
   * Get file provider.
   */
  getProvider(key: string, id: any) {
    this.baseArgs = { key, id };

    return new CustomFileSystemProvider({
      getItems: this.getItems.bind(this),
      createDirectory: this.createDirectory.bind(this),
      renameItem: this.renameItem.bind(this),
      copyItem: this.copyItem.bind(this),
      deleteItem: this.deleteItem.bind(this),
      moveItem: this.moveItem.bind(this),
      uploadFileChunk: this.uploadFileChunk.bind(this),
      abortFileUpload: this.abortFileUpload.bind(this),
      downloadItems: this.downloadItems.bind(this),
    });
  }

  /**
   * Provider custom functions.
   */
  getItems(parentDirectory: FileSystemItem): Promise<Array<any>> {
    return this._execute("list", {
      path: parentDirectory.path,
    });
  }

  createDirectory(
    parentDirectory: FileSystemItem,
    name: string,
  ): Promise<any> {
    return this._execute("createDir", {
      path: parentDirectory.path,
      name,
    });
  }

  renameItem(item: FileSystemItem, newName: string): Promise<any> {
    return this._execute("rename", {
      path: item.path,
      name: newName,
    });
  }

  copyItem(
    item: FileSystemItem,
    destinationDir: FileSystemItem,
  ): Promise<any> {
    return this._execute("copy", {
      path: item.path,
      dest: destinationDir.path,
    });
  }

  deleteItem(item: FileSystemItem): Promise<any> {
    return this._execute("delete", {
      path: item.path,
    });
  }

  moveItem(
    item: FileSystemItem,
    destinationDir: FileSystemItem,
  ): Promise<any> {
    return this._execute("move", {
      path: item.path,
      dest: destinationDir.path,
    });
  }

  uploadFileChunk(
    file: File,
    uploadInfo: UploadInfo,
    destinationDirectory: FileSystemItem,
  ) {
    if (0 === uploadInfo.chunkIndex) {
      uploadInfo.customData.uploadId = new Guid();
    }

    const formData = new FormData();
    const args = Object.assign({}, this.baseArgs, {
      dest: destinationDirectory.path,
      name: file.name,
      size: file.size,
      chunkData: {
        uploadId: uploadInfo.customData.uploadId,
        index: uploadInfo.chunkIndex,
        totalCount: uploadInfo.chunkCount,
      },
    });

    formData.append("chunk", uploadInfo.chunkBlob);
    formData.append("args", JSON.stringify(args));

    return this._execute("upload", formData);
  }

  abortFileUpload(file: File, uploadInfo: UploadInfo) {
    return this._execute("abort", {
      uploadId: uploadInfo.customData.uploadId,
    });
  }

  downloadItems(items: Array<FileSystemItem>) {
    const form = document.createElement("form");

    form.action = FileManagerService._buildUrl("download");
    form.method = "POST";
    form.target = "_blank";

    FileManagerService._formAppendInput(form, "key", this.baseArgs.key);
    if (this.baseArgs.id) FileManagerService._formAppendInput(form, "id", this.baseArgs.id);

    for (const file of items) {
      FileManagerService._formAppendInput(form, "files", encodeURIComponent(file.path));
    }

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  }

  /**
   * Post request.
   */
  private _execute(command: string, args: object): Promise<any> {
    const url = FileManagerService._buildUrl(command);

    if (command !== "upload") {
      args = Object.assign({}, this.baseArgs, args);
    }

    return this.httpClient
      .post(url, args, { withCredentials: true })
      .toPromise();
  }
}
