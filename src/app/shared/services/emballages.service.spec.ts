import { TestBed } from '@angular/core/testing';

import { EmballagesService } from './emballages.service';

describe('EmballagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmballagesService = TestBed.get(EmballagesService);
    expect(service).toBeTruthy();
  });
});
