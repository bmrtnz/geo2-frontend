import { Component, OnInit, Output, ViewChild } from "@angular/core";
import { AuthService } from "app/shared/services";
import { Program } from "app/shared/services/program.service";
import CommandesEdiComponent from "../indicateurs/commandes-edi/commandes-edi.component";
import { ImportProgrammesPopupComponent } from "../import-programmes-popup/import-programmes-popup.component";
import { TabContext } from "../root/root.component";


@Component({
  selector: "app-nouvel-ordre-main",
  templateUrl: "./nouvel-ordre-main.component.html",
  styleUrls: ["./nouvel-ordre-main.component.scss"],
})
export class NouvelOrdreMainComponent implements OnInit {

  public programs: any[];

  @Output() public programChosen: any;

  @ViewChild(CommandesEdiComponent, { static: false }) cdesEdiPopup: CommandesEdiComponent;
  @ViewChild(ImportProgrammesPopupComponent, { static: false }) importProgPopup: ImportProgrammesPopupComponent;

  constructor(
    public authService: AuthService,
    private tabContext: TabContext,
  ) { }

  ngOnInit() {
    this.programs = [];
    Object.keys(Program).map((prog) => {
      this.programs.push({
        id: Program[prog],
        name: prog,
        text: prog,
      });
    });
  }

  openCommandesEdi() {
    // this.cdesEdiPopup.visible = true;
    this.tabContext.openIndicator("CommandesEdi");
  }

  openProgramPopup(e) {
    this.programChosen = e;
    this.importProgPopup.visible = true;
  }

}
