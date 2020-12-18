import { TestBed } from '@angular/core/testing';

import { TransitairesService } from './transitaires.service';

describe('TransitairesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TransitairesService = TestBed.inject(TransitairesService);
    expect(service).toBeTruthy();
  });
});
