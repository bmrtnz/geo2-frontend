import { TestBed } from '@angular/core/testing';

import { AttribFraisService } from './attrib-frais.service';

describe('AttribFraisService', () => {
  let service: AttribFraisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttribFraisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
