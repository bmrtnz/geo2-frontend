import { TestBed } from "@angular/core/testing";

import { ReferencesClientService } from "./references-client.service";

describe("ReferencesClientService", () => {
  let service: ReferencesClientService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReferencesClientService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
