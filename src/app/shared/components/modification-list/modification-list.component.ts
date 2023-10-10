import {
  Component,
  NgModule,
  Input,
  OnInit,
  OnChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import {
  DxButtonModule,
  DxPopupModule,
  DxTemplateModule,
  DxTextBoxModule,
  DxBoxModule,
} from "devextreme-angular";
import { CommonModule } from "@angular/common";
import { AuthService, LocalizationService } from "app/shared/services";
import { SharedModule } from "app/shared/shared.module";
import DataSource from "devextreme/data/data_source";
import { ModificationsService } from "app/shared/services/api/modification.service";
import { Modification } from "app/shared/models";
import notify from "devextreme/ui/notify";
import { ValidationService } from "app/shared/services/api/validation.service";
import { DateManagementService } from "app/shared/services/date-management.service";

@Component({
  selector: "app-modification-list",
  templateUrl: "./modification-list.component.html",
  styleUrls: ["./modification-list.component.scss"],
})
export class ModificationListComponent implements OnChanges {
  @Input() entite: string;
  @Input() entiteID: string;
  @Output() modifs: any;
  @Output() listChange = new EventEmitter();

  modifications: DataSource;

  constructor(
    public authService: AuthService,
    private localizationService: LocalizationService,
    private dateManagementService: DateManagementService,
    public modificationsService: ModificationsService,
    public validationService: ValidationService
  ) { }

  ngOnChanges() {
    this.modifs = [];
    this.refreshList();
  }

  refreshList() {
    const columns = [
      "id",
      "entite",
      "entiteID",
      "dateModification",
      "initiateur.personne.id",
      "initiateur.nomUtilisateur",
      "statut",
      "corps.id",
      "corps.affichageActuel",
      "corps.affichageDemande",
      "corps.traductionKey",
    ];

    this.modificationsService
      .getAll(columns, [
        ["entite", "=", this.entite],
        "and",
        ["entiteID", "=", this.entiteID],
        "and",
        ["statut", "=", false],
      ])
      .subscribe((res) => {
        const liste = JSON.parse(JSON.stringify(res));
        if (liste.length) {
          liste.sort(
            (a, b) =>
              new Date(b.dateModification).getTime() -
              new Date(a.dateModification).getTime()
          );
          this.modifs = liste;
          this.modifs.map(
            (result) =>
            (result.dateModification =
              this.dateManagementService.friendlyDate(
                result.dateModification
              ))
          );
        }
      });
  }

  clearModifications(modif) {
    const modifID = modif?.id;

    // Create detailed info text
    let info = this.displayCapitalize(this.localizationService.localize("of")) + " ";
    info += modif.initiateur.personne.id + " - " + modif.initiateur.nomUtilisateur + " ";
    info += this.localizationService.localize("the");
    info += " " + modif.dateModification + " ";
    modif.corps.map(corps => {
      info += this.localizationService.localize(corps.traductionKey) + " : ";
      info += corps.affichageActuel.replace(this.localizationService.localize("not-set"), "") + " => ";
      info += corps.affichageDemande + " ";
    });

    const modification: Partial<Modification> = {
      id: modifID,
      statut: true,
    };
    this.modificationsService.save_v2(["id"], { modification }).subscribe({
      next: (e) => {
        this.modifs = this.modifs.filter((res) => res.id !== modifID);
        // Show red badges (unvalidated forms)
        this.validationService.showToValidateBadges();
        this.listChange.emit({ info: info, last: !this.modifs.length });
        notify(this.localizationService.localize("delete-ok"), "success", 3000);
      },
      error: () =>
        notify(this.localizationService.localize("delete-error"), "error", 3000),
    });
  }

  displayCapitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }

}

@NgModule({
  imports: [
    CommonModule,
    DxButtonModule,
    DxPopupModule,
    DxTemplateModule,
    DxTextBoxModule,
    DxBoxModule,
    SharedModule,
  ],
  declarations: [ModificationListComponent],
  exports: [ModificationListComponent],
})
export class ModificationListModule { }
