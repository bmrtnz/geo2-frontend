import { TestBed } from '@angular/core/testing';

import { SucresService } from './sucres.service';

describe('SucresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SucresService = TestBed.get(SucresService);
    expect(service).toBeTruthy();
  });
});
