import { TestBed } from '@angular/core/testing';

import { CiragesService } from './cirages.service';

describe('CiragesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CiragesService = TestBed.inject(CiragesService);
    expect(service).toBeTruthy();
  });
});
