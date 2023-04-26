import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { Contact } from "../../models";
import { APIRead, ApiService, RelayPage } from "../api.service";
import { GridColumn } from "../../../../basic";

@Injectable({
  providedIn: "root",
})
export class ContactsService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, Contact);
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(
                    this.asListCount(res.data.distinct),
                  );
              });

            const query = await this.buildGetAll_v2(columns);
            type Response = { allContact: RelayPage<Contact> };
            const variables =
              this.mapLoadOptionsToVariables(options);

            this.listenQuery<Response>(
              query,
              {
                variables,
                fetchPolicy: "network-only", // to work with editable dx-grid
              },
              (res) => {
                if (res.data && res.data.allContact)
                  resolve(
                    this.asInstancedListCount(
                      res.data.allContact,
                    ),
                  );
              },
            );
          }),
        byKey: (key) =>
          new Promise(async (resolve) => {
            const query = await this.buildGetOne_v2(columns);
            type Response = { contact: Contact };
            const variables = { id: key };
            this.listenQuery<Response>(
              query,
              { variables },
              (res) => {
                if (res.data && res.data.contact)
                  resolve(new Contact(res.data.contact));
              },
            );
          }),
        insert: (values) => {
          const variables = { contact: values };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        update: (key, values) => {
          const variables = { contact: { id: key, ...values } };
          return this.watchSaveQuery({ variables }).toPromise();
        },
        remove: (key) => {
          const variables = { id: key };
          return this.watchDeleteQuery({ variables }).toPromise() as unknown as PromiseLike<void>;
        },
      }),
    });
  }
}
