import { TestBed } from '@angular/core/testing';

import { OrdresBafService } from './ordres-baf.service';

describe('OrdresBafService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdresBafService = TestBed.get(OrdresBafService);
    expect(service).toBeTruthy();
  });
});
