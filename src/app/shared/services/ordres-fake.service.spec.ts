import { TestBed } from '@angular/core/testing';

import { FakeOrdresService } from './ordres-fake.service';

describe('OrdresFakeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FakeOrdresService = TestBed.inject(FakeOrdresService);
    expect(service).toBeTruthy();
  });
});
