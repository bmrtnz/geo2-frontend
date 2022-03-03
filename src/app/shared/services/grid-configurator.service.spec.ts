import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "./auth.service";
import { GridConfiguratorService } from "./grid-configurator.service";

describe("GridConfiguratorService", () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientTestingModule],
            providers: [AuthService],
        }),
    );

    it("should be created", () => {
        const service: GridConfiguratorService = TestBed.inject(
            GridConfiguratorService,
        );
        expect(service).toBeTruthy();
    });
});
