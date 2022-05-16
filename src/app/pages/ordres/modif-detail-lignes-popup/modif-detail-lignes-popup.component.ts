import { AfterViewInit, Component, Input, OnChanges, ViewChild } from "@angular/core";
import { ArticlesService } from "app/shared/services";
import { FunctionsService } from "app/shared/services/api/functions.service";

@Component({
  selector: "app-modif-detail-lignes-popup",
  templateUrl: "./modif-detail-lignes-popup.component.html",
  styleUrls: ["./modif-detail-lignes-popup.component.scss"]
})
export class ModifDetailLignesPopupComponent implements OnChanges {


  @Input() public ligneDetail: any;
  @ViewChild("form") NgForm: any;

  visible: boolean;
  articleDesc: string;
  validForm: boolean;

  constructor(
    private articlesService: ArticlesService,
    private functionsService: FunctionsService
  ) { }

  ngOnChanges() {
  }

  cancelClick() {
    this.visible = false;
  }

  applyClick(form) {
    console.log(form.value);

    // this.functionsService.onChangeCdeNbCol(idLigne, this.authService.currentUser.nomUtilisateur)
    //   .valueChanges.subscribe(this.handleCellChangeEventResponse());

    // Retrieve and apply all data with form.value
    this.clearData();
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add("modif-detail-lignes-popup");
    this.articleDesc = this.articlesService.concatArtDescript(this.ligneDetail.article).concatDesc;
  }

  onHidden() {
    this.clearData();
  }

  onValueChanged(e) {
    if (!e.event) return;
    let sum = 0;
    // Detecting null or empty values
    const myInputs = this.NgForm.form.value;
    Object.keys(myInputs).forEach(key => {
      if (myInputs[key] === "" || myInputs[key] === null) sum++;
    });
    this.validForm = !(sum === 4);
  }

  clearData() {
    this.NgForm.reset();
  }

  onFocusSB(e) {
    e.element.querySelector(".dx-texteditor-input")?.select();
  }

}
