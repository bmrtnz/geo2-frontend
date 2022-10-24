import { TestBed } from "@angular/core/testing";

import { DocumentsNumService } from "./documents-num.service";

describe("DocumentsNumService", () => {
  let service: DocumentsNumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentsNumService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
