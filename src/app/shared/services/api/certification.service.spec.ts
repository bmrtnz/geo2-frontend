import { TestBed } from '@angular/core/testing';

import { CertificationsService } from './certification.service';

describe('CertificationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CertificationsService = TestBed.inject(CertificationsService);
    expect(service).toBeTruthy();
  });
});
