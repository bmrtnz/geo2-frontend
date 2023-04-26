import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";
import Instruction from "app/shared/models/instruction.model";
import DataSource from "devextreme/data/data_source";
import { LoadOptions } from "devextreme/data/load_options";
import { APIRead, ApiService, RelayPage } from "../api.service";

@Injectable({
  providedIn: "root",
})
export class InstructionsService extends ApiService implements APIRead {
  constructor(apollo: Apollo) {
    super(apollo, Instruction);
  }

  private byKey(columns: Array<string>) {
    return (key) =>
      new Promise(async (resolve) => {
        const query = await this.buildGetOne_v2(columns);
        type Response = { instruction: Instruction };
        const variables = { id: key };
        this.listenQuery<Response>(query, { variables }, (res) => {
          if (res.data && res.data.instruction)
            resolve(new Instruction(res.data.instruction));
        });
      });
  }

  getDataSource_v2(columns: Array<string>) {
    return new DataSource({
      sort: [{ selector: this.model.getLabelField() as string }],
      pageSize: 500,
      store: this.createCustomStore({
        load: (options: LoadOptions) =>
          new Promise(async (resolve) => {
            if (options.group)
              return this.loadDistinctQuery(options, (res) => {
                if (res.data && res.data.distinct)
                  resolve(this.asListCount(res.data.distinct));
              });

            type Response = { allInstruction: RelayPage<Instruction> };
            const query = await this.buildGetAll_v2(columns);
            const variables = this.mapLoadOptionsToVariables(options);
            this.listenQuery<Response>(query, { variables }, (res) => {
              if (res.data && res.data.allInstruction) {
                resolve(this.asInstancedListCount(res.data.allInstruction));
              }
            });
          }),
        byKey: this.byKey(columns),
      }),
    });
  }
}
