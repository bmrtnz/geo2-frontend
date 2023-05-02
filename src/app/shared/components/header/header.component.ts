import {
  Component,
  NgModule,
  Input,
  Output,
  EventEmitter,
  HostListener,
  OnInit,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import DataSource from "devextreme/data/data_source";
import { AuthService, LocalizationService } from "../../services";
import { SocietesService } from "app/shared/services/api/societes.service";
import { UserPanelModule } from "../user-panel/user-panel.component";
import { CompanyChooserModule } from "../company-chooser/company-chooser.component";
import { DxButtonModule } from "devextreme-angular/ui/button";
import { DxToolbarModule } from "devextreme-angular/ui/toolbar";
import { FileManagerModule } from "../file-manager/file-manager-popup.component";
import { CurrentCompanyService } from "app/shared/services/current-company.service";

@Component({
  selector: "app-header",
  templateUrl: "header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Output()
  menuToggle = new EventEmitter<boolean>();

  @Input()
  menuToggleEnabled = false;

  @Input()
  title: string;
  perimetre: string;

  societeSource: DataSource;
  userMenuItems: any[];

  constructor(
    private localizeService: LocalizationService,
    private authService: AuthService,
    public societeService: SocietesService,
    public currentCompanyService: CurrentCompanyService
  ) {
    this.perimetre = this.authService.currentUser?.perimetre;
    this.userMenuItems = [
      {
        text: "Profil",
        icon: "user",
      },
      {
        text: this.localizeService.localize("auth-logout"),
        icon: "runner",
        onClick: async () => {
          await this.authService.logOut();
        },
      },
    ];
  }

  ngOnInit() {
    const filter = [];
    const filter2 = [];
    this.societeSource = this.societeService.getDataSource();
    filter.push(["valide", "=", true]);
    this.societeSource.filter(filter);

    // Authorized companies -> '*' all
    if (this.perimetre && this.perimetre !== "*") {
      this.perimetre.split(",").forEach((element) => {
        filter2.push(["id", "=", element]);
        filter2.push("or");
      });
      filter2.pop(); // Remove last 'or'
      this.societeSource.filter([filter2]);
    }
  }

  @HostListener("scroll", ["$event"]) onScrollEvent($event) {}

  toggleMenu = () => {
    this.menuToggle.emit();
  };
}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    UserPanelModule,
    CompanyChooserModule,
    FileManagerModule,
    DxToolbarModule,
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent],
})
export class HeaderModule {}
