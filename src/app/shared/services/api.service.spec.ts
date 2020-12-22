import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { Apollo, gql } from 'apollo-angular';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { Field, Model } from '../models/model';
import { ApiService, Direction, RelayPage } from './api.service';

class Test extends Model {
  @Field({asKey: true}) public id?: string;
  @Field({asLabel: true}) public description?: string;
  @Field() public valide?: boolean;
}
@Injectable({ providedIn: 'root'})
class TestApiService extends ApiService {
  constructor(
    apollo: Apollo,
  ) {
    super(apollo, Test);
  }
}

const mockRelayPage: RelayPage<Test> = {
  edges: [
    {
      node: {
        id: '001',
        description: 'The original',
        valide: true,
      },
      __typename: 'GeoTestEdge',
    },
    {
      node: {
        id: '002',
        description: 'Not the original',
        valide: false,
      },
      __typename: 'GeoTestEdge',
    },
  ],
  pageInfo: {
    startCursor: '1',
    endCursor: '10',
    hasPreviousPage: false,
    hasNextPage: false,
  },
  totalCount: 2,
};

describe('ApiService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TestApiService,
    ],
    imports: [
      ApolloTestingModule,
    ],
  }));

  it('should be created', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    expect(service).toBeTruthy();
  });

  it('should have associated model key field', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    expect(service.keyField).toEqual('id');
  });

  it('should handle `asListCount()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const listCount = service.asListCount(mockRelayPage);
    expect(listCount.totalCount).toEqual(mockRelayPage.totalCount);
    expect(listCount.data).toEqual(mockRelayPage.edges.map(({node}) => node ));
  });

  it('should handle `asInstancedListCount()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const instancedListCount = service.asInstancedListCount<Test>(mockRelayPage);
    expect(instancedListCount.totalCount).toEqual(mockRelayPage.totalCount);
    expect(instancedListCount.data).toEqual(mockRelayPage.edges.map(({node}) => new Test(node) ));
    expect(instancedListCount.data[0]).toEqual(jasmine.any(Test));
  });

  it('should handle `extractDirty()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const formGroup = new FormGroup({
      id: new FormControl(),
      description: new FormControl(),
      valide: new FormControl(false),
    });

    // Marking controls as dirty manually
    // see https://github.com/angular/angular/issues/9768
    formGroup.get('id').setValue('002');
    formGroup.get('description').setValue('Still a copy');
    formGroup.get('description').markAsDirty();

    const extracted = service.extractDirty(formGroup.controls);
    expect(extracted.id).toEqual('002'); // Keyfield always provided
    expect(extracted.description).toEqual('Still a copy');
    expect(extracted.valide).toBeUndefined();
  });

  it('should handle `locatePage()`', (done) => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const controller: ApolloTestingController = TestBed.inject(ApolloTestingController);

    service.locatePage({
      key: '002',
    }).subscribe( res => {
      expect(res.locatePage).toEqual(0);
      done();
    });

    const operation = controller.expectOne('LocatePage');
    expect(operation.operation.variables.key).toEqual('002');
    expect(operation.operation.variables.type).toEqual('GeoTest');
    operation.flush({data: { locatePage: 0 }});
    controller.verify();
  });

  it('should handle `createCustomStore()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const customStore = service.createCustomStore();

    expect(customStore.key()).toEqual(service.keyField);
  });

  it('should handle `mapDXSearchToDXFilter()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const mockLoadOptions = {
      searchOperation: '=',
      searchValue: 'true',
      searchExpr: 'valide',
    };
    const filter = service.mapDXSearchToDXFilter(mockLoadOptions);

    expect(filter).toEqual(['valide', '=', 'true']);
  });

  it('should handle `mapDXFilterToRSQL()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);

    expect(service.mapDXFilterToRSQL(['valide', '=', 'true']))
    .toEqual('valide=="true"');
    expect(service.mapDXFilterToRSQL(['valide', '<>', 'true']))
    .toEqual('valide!="true"');
    expect(service.mapDXFilterToRSQL(['description', 'contains', 'one']))
    .toEqual('description=ilike="%one%"');
    expect(service.mapDXFilterToRSQL(['description', 'notcontains', 'one']))
    .toEqual('description=inotlike="%one%"');
    expect(service.mapDXFilterToRSQL(['description', 'startswith', 'one']))
    .toEqual('description=ilike="one%"');
    expect(service.mapDXFilterToRSQL(['description', 'endswith', 'one']))
    .toEqual('description=ilike="%one"');
    expect(service.mapDXFilterToRSQL([
      ['valide', '=', 'true'],
      'and',
      ['id', '=', '002'],
    ]))
    .toEqual('valide=="true" and id=="002"');
    expect(service.mapDXFilterToRSQL([
      ['description', 'contains', 'one'],
      'or',
      ['description', 'contains', 'two'],
    ]))
    .toEqual('description=ilike="%one%" or description=ilike="%two%"');
  });

  it('should handle `mapLoadOptionsToVariables()`', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    const options = {
      skip: 0,
      take: 10,
      sort: [{ selector: 'id', desc: false }],
    };
    const variables = service.mapLoadOptionsToVariables(options);

    expect(variables.pageable.pageNumber).toEqual(options.skip / options.take);
    expect(variables.pageable.pageSize).toEqual(options.take);
    expect(variables.search).toEqual('');
    expect(variables.pageable.sort.orders)
    .toEqual([{ property: 'id', direction: Direction.ASC }]);
  });

});
