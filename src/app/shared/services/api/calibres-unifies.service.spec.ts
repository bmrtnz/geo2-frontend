import { TestBed } from '@angular/core/testing';

import { CalibresUnifiesService } from './calibres-unifies.service';

describe('CalibresUnifiesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CalibresUnifiesService = TestBed.get(CalibresUnifiesService);
    expect(service).toBeTruthy();
  });
});
