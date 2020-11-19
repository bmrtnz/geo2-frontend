import { TestBed } from '@angular/core/testing';

import { CourtiersService } from './courtiers.service';

describe('CourtiersService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CourtiersService = TestBed.get(CourtiersService);
    expect(service).toBeTruthy();
  });
});
