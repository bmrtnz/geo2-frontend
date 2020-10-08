import { TestBed } from '@angular/core/testing';

import { OrdresFakeService } from './ordres-fake.service';

describe('OrdresFakeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrdresFakeService = TestBed.get(OrdresFakeService);
    expect(service).toBeTruthy();
  });
});
