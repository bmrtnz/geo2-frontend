import { TestBed } from '@angular/core/testing';

import { DevisesService } from './devises.service';

describe('DevisesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DevisesService = TestBed.get(DevisesService);
    expect(service).toBeTruthy();
  });
});
