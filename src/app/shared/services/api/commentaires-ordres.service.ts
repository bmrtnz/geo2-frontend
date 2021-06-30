import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import CommentaireOrdre from 'app/shared/models/commentaire-ordre.model';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class CommentairesOrdresService extends ApiService implements APIRead {


  constructor(
    apollo: Apollo,
  ) {
    super(apollo, CommentaireOrdre);
    this.gqlKeyType = 'GeoCommentaireOrdreKeyInput';
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: 'dateModification' }
      ],
      store: this.createCustomStore({
        key: ['id', 'ordreId'],
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1);
          type Response = { allCommentaireOrdre: RelayPage<CommentaireOrdre> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allCommentaireOrdre)
              resolve(this.asInstancedListCount(res.data.allCommentaireOrdre));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne();
          type Response = { commentaireOrdre: CommentaireOrdre };
          const id = key ? {id: key.id, ordre: key.ordreId || ''} : {};
          const variables = { id };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.commentaireOrdre)
              resolve(new CommentaireOrdre(res.data.commentaireOrdre));
          });
        }),
      }),
    });
  }

}
