import { TestBed } from '@angular/core/testing';

import { DevisesRefsService } from './devises-refs.service';

describe('DevisesRefsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DevisesRefsService = TestBed.get(DevisesRefsService);
    expect(service).toBeTruthy();
  });
});
