import { TestBed } from "@angular/core/testing";

import { PacklistsService } from "./packlists.service";

describe("PacklistsService", () => {
  let service: PacklistsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacklistsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
