import { Injectable } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormControl, FormGroup } from "@angular/forms";
import { Apollo } from "apollo-angular";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import { LoadOptions } from "devextreme/data/load_options";
import { Field, Model } from "../models/model";
import { ApiService, Direction, RelayPage } from "./api.service";
import { FormUtilsService } from "./form-utils.service";

class Test extends Model {
  @Field({ asKey: true }) public id?: string;
  @Field({ asLabel: true }) public description?: string;
  @Field() public valide?: boolean;
}
@Injectable({ providedIn: "root" })
class TestApiService extends ApiService {
  constructor(apollo: Apollo) {
    super(apollo, Test);
  }
}

const mockRelayPage: RelayPage<Test> = {
  edges: [
    {
      node: {
        id: "001",
        description: "The original",
        valide: true,
      },
      __typename: "GeoTestEdge",
    },
    {
      node: {
        id: "002",
        description: "Not the original",
        valide: false,
      },
      __typename: "GeoTestEdge",
    },
  ],
  pageInfo: {
    startCursor: "1",
    endCursor: "10",
    hasPreviousPage: false,
    hasNextPage: false,
  },
  totalCount: 2,
};

describe("ApiService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [TestApiService],
      imports: [ApolloTestingModule],
    }),
  );

  it("should be created", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    expect(service).toBeTruthy();
  });

  it("should have associated model key field", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    expect(service.keyField).toEqual("id");
  });

  it("should handle `asListCount()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const listCount = service.asListCount(mockRelayPage);
    expect(listCount.totalCount).toEqual(mockRelayPage.totalCount);
    expect(listCount.data).toEqual(
      mockRelayPage.edges.map(({ node }) => node),
    );
  });

  it("should handle `asInstancedListCount()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const instancedListCount =
      service.asInstancedListCount<Test>(mockRelayPage);
    expect(instancedListCount.totalCount).toEqual(mockRelayPage.totalCount);
    expect(instancedListCount.data).toEqual(
      mockRelayPage.edges.map(({ node }) => new Test(node)),
    );
    expect(instancedListCount.data[0]).toEqual(jasmine.any(Test));
  });

  it("should handle `extractDirty()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const formUtils: FormUtilsService = TestBed.inject(FormUtilsService);
    const formGroup = new FormGroup({
      id: new FormControl(),
      description: new FormControl(),
      valide: new FormControl(false),
    });

    // Marking controls as dirty manually
    // see https://github.com/angular/angular/issues/9768
    formGroup.get("id").setValue("002");
    formGroup.get("description").setValue("Still a copy");
    formGroup.get("description").markAsDirty();

    const extracted = formUtils.extractDirty(formGroup.controls, "id");
    expect(extracted.id).toEqual("002"); // Keyfield always provided
    expect(extracted.description).toEqual("Still a copy");
    expect(extracted.valide).toBeUndefined();
  });

  it("should handle `locatePage()`", (done) => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const controller: ApolloTestingController = TestBed.inject(
      ApolloTestingController,
    );

    service
      .locatePage({
        key: "002",
      })
      .subscribe((res) => {
        expect(res.locatePage).toEqual(0);
        done();
      });

    const operation = controller.expectOne("LocatePage");
    expect(operation.operation.variables.key).toEqual("002");
    expect(operation.operation.variables.type).toEqual("GeoTest");
    operation.flush({ data: { locatePage: 0 } });
    controller.verify();
  });

  it("should handle `createCustomStore()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const customStore = service.createCustomStore();

    expect(customStore.key()).toEqual(service.keyField);
  });

  it("should handle `mapDXSearchToDXFilter()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const mockLoadOptions = {
      searchOperation: "=",
      searchValue: "true",
      searchExpr: "valide",
    };
    const filter = service.mapDXSearchToDXFilter(mockLoadOptions as any);

    expect(filter).toEqual(["valide", "=", "true"]);
  });

  it("should handle `mapDXFilterToRSQL()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);

    expect(service.mapDXFilterToRSQL(["valide", "=", "true"])).toEqual(
      "valide==\"true\"",
    );
    expect(service.mapDXFilterToRSQL(["valide", "<>", "true"])).toEqual(
      "valide!=\"true\"",
    );
    expect(
      service.mapDXFilterToRSQL(["description", "contains", "one"]),
    ).toEqual("description=ilike=\"%one%\"");
    expect(
      service.mapDXFilterToRSQL(["description", "notcontains", "one"]),
    ).toEqual("description=inotlike=\"%one%\"");
    expect(
      service.mapDXFilterToRSQL(["description", "startswith", "one"]),
    ).toEqual("description=ilike=\"one%\"");
    expect(
      service.mapDXFilterToRSQL(["description", "endswith", "one"]),
    ).toEqual("description=ilike=\"%one\"");
    expect(
      service.mapDXFilterToRSQL([
        ["valide", "=", "true"],
        "and",
        ["id", "=", "002"],
      ]),
    ).toEqual("valide==\"true\" and id==\"002\"");
    expect(
      service.mapDXFilterToRSQL([
        ["description", "contains", "one"],
        "or",
        ["description", "contains", "two"],
      ]),
    ).toEqual("description=ilike=\"%one%\" or description=ilike=\"%two%\"");
  });

  it("should handle `mapLoadOptionsToVariables()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const options = {
      skip: 0,
      take: 10,
      sort: [{ selector: "id", desc: false }],
    };
    const variables = service.mapLoadOptionsToVariables(options);

    expect(variables.pageable.pageNumber).toEqual(
      options.skip / options.take,
    );
    expect(variables.pageable.pageSize).toEqual(options.take);
    expect(variables.search).toEqual("");
    expect(variables.pageable.sort.orders).toEqual([
      { property: "id", direction: Direction.ASC },
    ]);
  });

  it("should handle `mergeVariables()`", () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const merged = service.mergeVariables(
      { search: "valide==true" },
      { search: "description=ilike=\"%one%\"" },
    );

    expect(merged.search).toEqual(
      "(valide==true) and (description=ilike=\"%one%\")",
    );
  });

  it("should handle `listenQuery()`", (done) => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const controller: ApolloTestingController = TestBed.inject(
      ApolloTestingController,
    );
    const query = `
      query Test($id: Int!) {
        test(id: $id) {
          id
          valide
        }
      }
    `;

    service.listenQuery<{ test: Test }>(
      query,
      { variables: { id: "002" } },
      (res) => {
        expect(res.data.test.id).toEqual("002");
        expect(res.data.test.valide).toEqual(false);
        done();
      },
    );

    const operation = controller.expectOne("Test");
    expect(operation.operation.variables.id).toEqual("002");
    operation.flush({
      data: {
        test: mockRelayPage.edges.find(({ node }) => node.id === "002")
          .node,
      },
    });
    controller.verify();
  });

  // TEST DISABLED - Operation not found, probably due to async query building
  // it('should handle `watchGetOneQuery()`', (done) => {
  //   const service: TestApiService = TestBed.inject(TestApiService);
  //   const controller: ApolloTestingController = TestBed.inject(ApolloTestingController);

  //   service.watchGetOneQuery<{ test: Test }>({ variables: { id: '001' }})
  //   .subscribe( res => {
  //     expect(res.data.test.id).toEqual('001');
  //     done();
  //   });

  //   const operation = controller.expectOne('Test');
  //   expect(operation.operation.variables.id).toEqual('001');
  //   operation.flush({data: {
  //     test: mockRelayPage.edges
  //     // .map( edge => ({...edge, node: {...edge.node, __typename: 'GeoTest' }}))
  //     .find(({node}) => node.id === '001')
  //     .node,
  //   }});
  //   controller.verify();
  // });

  it("should handle `loadDistinctQuery()`", (done) => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const controller: ApolloTestingController = TestBed.inject(
      ApolloTestingController,
    );
    const options: LoadOptions = {
      group: { selector: "id" },
    };

    service.loadDistinctQuery(options, (res) => {
      expect(res.data.totalCount).toEqual(2);
      expect(res.data.distinct.edges.length).toEqual(2);
      done();
    });

    const operation = controller.expectOne("Distinct");
    expect(operation.operation.variables.field).toEqual("id");
    operation.flush({
      data: {
        distinct: {
          edges: [
            {
              node: {
                count: 1,
                key: "001",
              },
            },
            {
              node: {
                count: 1,
                key: "002",
              },
            },
          ],
        },
        totalPage: 1,
        totalCount: 2,
      },
    });
    controller.verify();
  });

  // TEST DISABLED - Operation not found, probably due to async query building
  // it('should handle `watchSaveQuery()`', (done) => {
  //   const service: TestApiService = TestBed.inject(TestApiService);
  //   const controller: ApolloTestingController = TestBed.inject(ApolloTestingController);
  //   const variables = { test: { id: '001', valide: false }};

  //   service.watchSaveQuery({ variables })
  //   .subscribe( _ => done());

  //   const operation = controller.expectOne('SaveTest');
  //   expect(operation.operation.variables.test.id).toEqual('001');
  //   expect(operation.operation.variables.test.valide).toEqual(false);
  //   operation.flush({data: {
  //     test: {
  //       id: '001',
  //       valide: false,
  //     },
  //   }});
  //   controller.verify();
  // });

  it("should handle `watchDeleteQuery()`", (done) => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const controller: ApolloTestingController = TestBed.inject(
      ApolloTestingController,
    );
    const variables = { test: { id: "001" } };

    service.watchDeleteQuery({ variables }).subscribe((_) => done());

    const operation = controller.expectOne("DeleteTest");
    expect(operation.operation.variables.test.id).toEqual("001");
    operation.flush({ data: {} });
    controller.verify();
  });
});
