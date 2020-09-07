import { TestBed } from '@angular/core/testing';

import { LoadsavedatagridstateService } from './loadsavedatagridstate.service';

describe('LoadsavedatagridstateService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LoadsavedatagridstateService = TestBed.get(LoadsavedatagridstateService);
    expect(service).toBeTruthy();
  });
});
