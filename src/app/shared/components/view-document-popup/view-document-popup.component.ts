import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnInit,
  Output,
} from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { DxPopupModule } from "devextreme-angular";
import { environment } from "environments/environment";
import Document from "../../models/document.model";
import { ScreenService } from "../../services";
import { SharedModule } from "../../shared.module";

export interface ViewDocument {
  title: string;
  document: Document;
}

@Component({
  selector: "app-view-document-popup",
  templateUrl: "./view-document-popup.component.html",
  styleUrls: ["./view-document-popup.component.scss"],
})
export class ViewDocumentPopupComponent implements OnInit, OnChanges {
  @Input()
  public document: ViewDocument;

  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  public fullScreen: boolean;
  public safeUrl: SafeUrl;

  constructor(private screen: ScreenService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.fullScreen = !this.screen.sizes["screen-large"];
  }

  ngOnChanges(changes: any) {
    if (changes.document && changes.document.currentValue) {
      const document = changes.document.currentValue;

      this.safeUrl = this.sanitize(document);
    }
  }

  private sanitize(document: ViewDocument): SafeUrl {
    const isFrame = document.document.type === "iframe";
    let fullUrl = environment.apiEndpoint + document.document.uri;
    const sanitizerUrl = isFrame
      ? this.sanitizer.bypassSecurityTrustResourceUrl
      : this.sanitizer.bypassSecurityTrustUrl;

    if (isFrame) {
      fullUrl += "?embedded=true";
    }

    return sanitizerUrl(fullUrl);
  }

  onClose() {
    this.visibleChange.emit(this.visible);
  }
}

@NgModule({
  declarations: [ViewDocumentPopupComponent],
  imports: [SharedModule, DxPopupModule],
  exports: [ViewDocumentPopupComponent],
})
export class ViewDocumentPopupModule {}
