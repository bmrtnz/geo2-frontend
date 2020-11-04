import { TestBed } from '@angular/core/testing';
import { GridConfiguratorService } from './grid-configurator.service';

describe('DataGridConfigService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GridConfiguratorService = TestBed.get(GridConfiguratorService);
    expect(service).toBeTruthy();
  });
});
