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
import { AuthService } from "app/shared/services";
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
  @Output() idUtilisateur = new EventEmitter();

  modifications: DataSource;

  constructor(
    public authService: AuthService,
    private dateManagementService: DateManagementService,
    public modificationsService: ModificationsService,
    public validationService: ValidationService,
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
              new Date(a.dateModification).getTime(),
          );
          this.modifs = liste;
          this.modifs.map(
            (result) =>
              (result.dateModification =
                this.dateManagementService.friendlyDate(
                  result.dateModification,
                )),
          );
        }
      });
  }

  clearModifications(modifID, modifIDUtilisateur) {
    this.idUtilisateur.emit(modifIDUtilisateur);

    const modification: Partial<Modification> = {
      id: modifID,
      statut: true,
    };
    this.modificationsService.save_v2([
      "id",
    ], { modification }).subscribe({
      next: (e) => {
        this.modifs = this.modifs.filter((res) => res.id !== modifID);
        // Show red badges (unvalidated forms)
        this.validationService.showToValidateBadges();
        this.listChange.emit(this.modifs.length);
        notify("Suppression demande effectuée !", "success", 3000);
      },
      error: () =>
        notify(
          "Erreur lors de la demande de suppression",
          "error",
          3000,
        ),
    });
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
