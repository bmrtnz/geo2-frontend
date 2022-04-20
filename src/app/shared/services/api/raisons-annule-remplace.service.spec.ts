import { TestBed } from "@angular/core/testing";

import { RaisonsAnnuleRemplaceService } from "./raisons-annule-remplace.service";

describe("RaisonsAnnuleRemplaceService", () => {
  let service: RaisonsAnnuleRemplaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaisonsAnnuleRemplaceService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
