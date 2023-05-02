import { TestBed } from "@angular/core/testing";

import { LogService } from "./log.service";

describe("LogService", () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [LogService],
    })
  );

  it("should be created", () => {
    const service: LogService = TestBed.inject(LogService);
    expect(service).toBeTruthy();
  });
});
