import { Apollo } from 'apollo-angular';
import { OperationVariables } from '@apollo/client/core';
import { Injectable } from '@angular/core';
import { Modification, ModificationCorps } from '../../models';
import { ApiService, APIRead, RelayPage } from '../api.service';


import { LoadOptions } from 'devextreme/data/load_options';
import DataSource from 'devextreme/data/data_source';
import { AuthService } from '../auth.service';
import notify from 'devextreme/ui/notify';
import { Router } from '@angular/router';
import { AbstractControl, AbstractControlDirective, AbstractControlOptions, FormGroup } from '@angular/forms';
import { from, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ModificationsService extends ApiService implements APIRead {

  fieldsFilter = /.*\.(?:id|entite|entiteID|dateModification|initiateur|corps|statut)$/i;
  notSet = '(non renseigné)';

  constructor(
    apollo: Apollo,
    public authService: AuthService,
    private router: Router,
   ) {
    super(apollo, Modification);
  }

  getOne(id: number) {
    const variables: OperationVariables = { id };
    type Response = { modification: Modification };
    return this.watchGetOneQuery<Response>({variables});
  }

  getAll(columns: string[], filter: any[]) {
    return from(
      new Promise( async resolve => {
        type Response = { listModification: Modification[] };
        const search = this.mapDXFilterToRSQL(filter);
        const query = await this.buildGetList(columns);
        this.listenQuery<Response>(query, {variables : {search}, fetchPolicy: 'no-cache'}, res => {
          if (res.data && res.data.listModification)
            resolve(res.data.listModification);
        });
      })
    );
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

  save(variables: OperationVariables, depth = 2) {
    return this.watchSaveQuery({ variables }, depth);
  }

  getValue(el) {
    if (typeof el === 'object' && !Array.isArray(el) && el !== null) {
      return (el.nomUtilisateur ? el.nomUtilisateur : (el.raisonSocial ? el.raisonSocial : el.description));
    } else {
      return el !== null ? this.convertTrueFalse(el) : this.notSet;
    }
  }

  convertTrueFalse(val) {
    val = val === true ? 'Oui' : (val === false ? 'Non' : val);
    return val;
  }

  saveModifications(modelName, entityObject, fGroup: FormGroup, traductionKey) {

    const listeModifications: Partial<ModificationCorps>[] =
      Object.entries(fGroup.controls).filter( ([ , control]) => control.dirty && control.value !== null).map( ([key, control]) => {
        return {
          affichageActuel: this.getValue(entityObject[key]),
          affichageDemande: this.getValue(control.value),
          chemin: modelName + '.' + key,
          traductionKey: traductionKey + key,
          valeurActuelle: entityObject[key] ? entityObject[key].id ? entityObject[key].id : entityObject[key] : this.notSet,
          valeurDemandee: typeof control.value === 'object' ? control.value.id : control.value
        };
      }
    );

    const modification: Partial<Modification> = {
      entite: modelName,
      entiteID: entityObject.id,
      initiateur: {nomUtilisateur : this.authService.currentUser.nomUtilisateur},
      corps: listeModifications as ModificationCorps[]
    };

     // Back to initial state
    fGroup.patchValue(entityObject);
    fGroup.markAsPristine();

    console.log('listeModifications :' , listeModifications);

    return this.save( {modification} )
    .pipe(
      catchError(() => {
        notify('Erreur enregistrement demande de modification', 'error', 3000);
        return of(new Error());
      }),
      tap((e) => {
        if (e instanceof Error) return;
        notify('Demande de modification enregistrée', 'success', 3000);
      })
    );

  }

}
