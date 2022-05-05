import { Component, Input, OnChanges, ViewChild } from "@angular/core";
import { ArticlesService } from "app/shared/services";


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

  constructor(
    private articlesService: ArticlesService,
  ) { }

  ngOnChanges() {
  }

  cancelClick() {
    this.visible = false;
  }

  applyClick(form) {
    console.log(form.value);
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

  clearData() {
    this.NgForm.reset();
  }

}
