import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { Field, Model } from '../models/model';
import { ApiService } from './api.service';

class TestModel extends Model {
  @Field({asKey: true}) public id: string;
  @Field({asLabel: true}) public description: string;
  @Field() public valide: boolean;
}
@Injectable({ providedIn: 'root'})
class TestApiService extends ApiService {
  constructor(
    apollo: Apollo,
  ) {
    super(apollo, TestModel);
  }
}

describe('ApiService', () => {

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      TestApiService,
    ],
  }));

  it('should be created', () => {
    const service: TestApiService = TestBed.inject(TestApiService);
    expect(service).toBeTruthy();
  });

});
