import { TestBed } from '@angular/core/testing';

import { MruOrdresService } from './mru-ordres.service';

describe('MruOrdresService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MruOrdresService = TestBed.get(MruOrdresService);
    expect(service).toBeTruthy();
  });
});
