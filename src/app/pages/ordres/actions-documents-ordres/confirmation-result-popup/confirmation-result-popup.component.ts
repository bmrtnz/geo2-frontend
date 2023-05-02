import { Component, EventEmitter, Output, ViewChild } from "@angular/core";
import { DxPopupComponent } from "devextreme-angular";
import { take, tap } from "rxjs/operators";

type MessageState = "ERROR" | "WARNING";

@Component({
  selector: "app-confirmation-result-popup",
  templateUrl: "./confirmation-result-popup.component.html",
  styleUrls: ["./confirmation-result-popup.component.scss"],
})
export class ConfirmationResultPopupComponent {
  public content: string;
  public state: MessageState = "WARNING";
  public continueButtonOptions = {
    text: "Continuer",
    stylingMode: "outlined",
    type: "danger",
    onClick: () => this.advance.emit(true),
  };
  public backButtonOptions = {
    text: "Retour",
    stylingMode: "contained",
    onClick: () => this.advance.emit(false),
  };

  /** Emitted on user action (cancel, continue) */
  @Output() public advance = new EventEmitter<boolean>();

  @ViewChild(DxPopupComponent) popup: DxPopupComponent;

  constructor() {}

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
