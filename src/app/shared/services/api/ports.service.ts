import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import DataSource from 'devextreme/data/data_source';
import { LoadOptions } from 'devextreme/data/load_options';
import { Port } from 'app/shared/models';
import { APIRead, ApiService, RelayPage } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class PortsService extends ApiService implements APIRead {

  listRegexp = /.*\.(?:id|name)$/i;

  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Port);
  }

  getDataSource() {
    return new DataSource({
      sort: [
        { selector: 'name' }
      ],
      store: this.createCustomStore({
        load: (options: LoadOptions) => new Promise(async (resolve) => {

          if (options.group)
            return this.loadDistinctQuery(options, res => {
              if (res.data && res.data.distinct)
                resolve(this.asListCount(res.data.distinct));
            });

          const query = await this.buildGetAll(1, this.listRegexp);
          type Response = { allPort: RelayPage<Port> };
          const variables = this.mapLoadOptionsToVariables(options);

          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.allPort)
              resolve(this.asInstancedListCount(res.data.allPort));
          });
        }),
        byKey: (key) => new Promise(async (resolve) => {
          const query = await this.buildGetOne(1, this.listRegexp);
          type Response = { port: Port };
          const variables = { id: key };
          this.listenQuery<Response>(query, { variables }, res => {
            if (res.data && res.data.port)
              resolve(new Port(res.data.port));
          });
        }),
      }),
    });
  }

}
