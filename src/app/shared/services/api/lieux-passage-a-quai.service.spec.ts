import { TestBed } from '@angular/core/testing';

import { LieuxPassageAQuaiService } from './lieux-passage-a-quai.service';

describe('LieuxPassageAQuaiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LieuxPassageAQuaiService = TestBed.inject(LieuxPassageAQuaiService);
    expect(service).toBeTruthy();
  });
});
