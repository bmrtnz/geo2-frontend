import { TestBed } from '@angular/core/testing';

import { SecteursService } from './secteurs.service';

describe('SecteursService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SecteursService = TestBed.get(SecteursService);
    expect(service).toBeTruthy();
  });
});
