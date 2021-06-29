import { TestBed } from '@angular/core/testing';

import { EnvoisService } from './envois.service';

describe('EnvoisService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EnvoisService = TestBed.get(EnvoisService);
    expect(service).toBeTruthy();
  });
});
