import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { ChooseOrdrePopupComponent } from "app/shared/components/choose-ordre-popup/choose-ordre-popup.component";
import { LocalizationService } from "app/shared/services";
import { DxPopupComponent, DxPopupModule } from "devextreme-angular";
import { DxiToolbarItemModule } from "devextreme-angular/ui/nested";
import { take, tap } from "rxjs/operators";

type MessageState = "ERROR" | "WARNING";

@Component({
  selector: "app-confirmation-result-popup",
  templateUrl: "./confirmation-result-popup.component.html",
  styleUrls: ["./confirmation-result-popup.component.scss"],
})
export class ConfirmationResultPopupComponent implements OnInit {
  public content: string;
  public state: MessageState = "WARNING";

  @Input() public continuTextKey = "btn-continuer";
  @Input() public backTextKey = "btn-annuler";

  public continueButtonOptions;
  public backButtonOptions;

  /** Emitted on user action (cancel, continue) */
  @Output() public advance = new EventEmitter<boolean>();

  @ViewChild(DxPopupComponent) popup: DxPopupComponent;

  constructor(private localization: LocalizationService) { }

  ngOnInit() {
    this.continueButtonOptions = {
      text: this.localization.localize(this.continuTextKey),
      stylingMode: "contained",
      onClick: () => this.advance.emit(true),
    };
    this.backButtonOptions = {
      text: this.localization.localize(this.backTextKey),
      stylingMode: "outlined",
      type: "danger",
      onClick: () => this.advance.emit(false),
    };
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("confirmation-result-popup");
  }

  /**
   * It sets the state and content, shows the modal, and returns the advance emitter.
   */
  public openAs(state: MessageState, content: string) {
    this.state = state;
    console.log(content);
    if (content.indexOf("Exception while fetching data") >= 0)
      content = content.substring(content.indexOf(":") + 2);
    this.content = content
      .split(/~r~n|~r|~n/)
      .map((chunk) => `<p>${chunk}</p>`)
      .join("");
    this.popup.instance.show();
    return this.advance.pipe(
      take(1),
      tap((_) => this.popup.instance.hide())
    );
  }
}

@NgModule({
  imports: [CommonModule, DxPopupModule, DxiToolbarItemModule],
  declarations: [ConfirmationResultPopupComponent],
  exports: [ConfirmationResultPopupComponent],
})
export class ConfirmationResultPopupModule { }
