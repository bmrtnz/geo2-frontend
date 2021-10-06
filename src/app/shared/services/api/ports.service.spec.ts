import { TestBed } from '@angular/core/testing';

import { PortsService } from './ports.service';

describe('PortsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PortsService = TestBed.get(PortsService);
    expect(service).toBeTruthy();
  });
});
