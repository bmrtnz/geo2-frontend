import { Component, NgModule, Input, OnInit } from '@angular/core';
import { DxButtonModule, DxPopupModule, DxTemplateModule, DxTextBoxModule, DxBoxModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { AuthService } from 'app/shared/services';
import { SharedModule } from 'app/shared/shared.module';
import DataSource from 'devextreme/data/data_source';
import { ModificationsService } from 'app/shared/services/api/modification.service';
import { Modification } from 'app/shared/models';
import notify from 'devextreme/ui/notify';


@Component({
  selector: 'app-modification-list',
  templateUrl: './modification-list.component.html',
  styleUrls: ['./modification-list.component.scss']
})
export class ModificationListComponent implements OnInit {

  @Input() entite: string;
  @Input() entiteID: string;

  modifications: DataSource;
  modifs: any;

  constructor(
    public authService: AuthService,
    public modificationsService: ModificationsService
    ) { }

  ngOnInit() {
    this.showModificationList();
  }

  customDate(dateModif) {
    const mydate = new Date(dateModif);
    return mydate.toLocaleDateString() + ' à ' + mydate.toLocaleTimeString();
  }

  showModificationList() {

    this.modifications = this.modificationsService
    .getDataSource_v2(['id', 'entite', 'entiteID', 'dateModification', 'initiateur.nomUtilisateur', 'statut', 'corps.id',
    'corps.affichageActuel', 'corps.affichageDemande', 'corps.traductionKey']);
    this.modifications.filter([
      ['entite', '=', this.entite],
      'and',
      ['entiteID', '=', this.entiteID],
      'and',
      ['statut', '=', false]
    ]);

    this.modifications.load().then((res) => {
      if (res.length) {
        this.modifs = res;
        this.modifs.map(result => result.dateModification = this.customDate(result.dateModification));
      }
      console.log(res)
    });

  }

  clearModifications(modifID) {
    const modification: Partial<Modification> = {
      id: modifID,
      statut: true
    };
    this.modificationsService.save( {modification} )
    .subscribe({
      next: (e) => {
        this.modifs = this.modifs.filter(res => res.id !== modifID);
        notify('Suppression demande effectuée !', 'success', 3000);
      },
      error: () => notify('Erreur lors de la demande de suppression', 'error', 3000),
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
    SharedModule
  ],
  declarations: [ModificationListComponent],
  exports: [ModificationListComponent]
})
export class ModificationListModule {
}
