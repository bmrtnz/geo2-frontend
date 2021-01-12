import { TestBed } from '@angular/core/testing';

import { StickeursService } from './stickeurs.service';

describe('StickeursService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StickeursService = TestBed.inject(StickeursService);
    expect(service).toBeTruthy();
  });
});
