import { TestBed } from '@angular/core/testing';

import { LitigesLignesService } from './litiges-lignes.service';

describe('LitigesLignesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LitigesLignesService = TestBed.get(LitigesLignesService);
    expect(service).toBeTruthy();
  });
});
