import { Apollo } from 'apollo-angular';
import { OperationVariables } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { Modification, ModificationCorps } from '../../models';
import { ApiService, APIRead, RelayPage } from '../api.service';


import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { AuthService } from '../auth.service';
import notify from 'devextreme/ui/notify';

@Injectable({
  providedIn: 'root'
})
export class ModificationsService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|entite|entiteID|dateModification|initiateur|corps|statut)$/i;
  notSet = '(non renseigné)';

  constructor(
    apollo: Apollo,
    authService: AuthService,
  ) {
    super(apollo, Modification);
  }

  getOne(id: number) {
    const variables: OperationVariables = { id };
    type Response = { modification: Modification };
    return this.watchGetOneQuery<Response>({variables});
  }

  getDataSource_v2(columns: Array<string>) {
    type Response = { allModification: RelayPage<Modification> };
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll_v2(columns);
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, {variables}, res => {
            if (res.data && res.data.allModification)
              resolve(this.asInstancedListCount(res.data.allModification));
          });
        }),
      }),
    });
  }

  save(variables: OperationVariables) {
    return this.watchSaveQuery({ variables });
  }

  // saveModifications(modelName, entityObject, ctrls, traductionKey) {

  //   const listeModifications: Partial<ModificationCorps>[] =
  //     Object.entries(ctrls).filter( ([ , control]) => control.dirty ).map( ([key, control]) => {
  //       return {
  //         affichageActuel: this.getValue(entityObject[key]),
  //         affichageDemande: this.getValue(control.value),
  //         chemin: modelName + '.' + key,
  //         traductionKey: traductionKey + key,
  //         valeurActuelle: entityObject[key] ? entityObject[key] : this.notSet,
  //         valeurDemandee: control.value
  //       };
  //     }
  //   );

  //   const modification: Partial<Modification> = {
  //     entite: modelName,
  //     entiteID: entityObject.id,
  //     initiateur: {nomUtilisateur : this.authService.currentUser.nomUtilisateur},
  //     corps: listeModifications as ModificationCorps[]
  //   };

  //   console.log('listeModifications :' , listeModifications);

  //   this.save( {modification} )
  //   .subscribe({
  //     next: (e) => {
  //       notify('Demande de modification enregistrée', 'success', 3000);
  //       this.readOnlyMode = true;
  //       this.editing = false;
  //       this.router.navigate([`/tiers/clients/${client.id}`]);
  //     },
  //     error: () => notify('Erreur enregistrement demande de modification', 'error', 3000),
  //   });

  // }

}
