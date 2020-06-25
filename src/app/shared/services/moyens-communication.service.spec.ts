import { TestBed } from '@angular/core/testing';

import { MoyensCommunicationService } from './moyens-communication.service';

describe('MoyensCommunicationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MoyensCommunicationService = TestBed.get(MoyensCommunicationService);
    expect(service).toBeTruthy();
  });
});
