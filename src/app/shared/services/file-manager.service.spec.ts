import { TestBed } from '@angular/core/testing';

import { FileManagerService } from './file-manager.service';

describe('FileManagerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [ FileManagerService ],
  }));

  it('should be created', () => {
    const service: FileManagerService = TestBed.inject(FileManagerService);
    expect(service).toBeTruthy();
  });
});
