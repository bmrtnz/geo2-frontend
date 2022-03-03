import { TestBed } from "@angular/core/testing";
import { LocalizationService } from "../services";
import { LocalizePipe } from "./localize.pipe";

describe("LocalizePipe", () => {
    let localizationService: LocalizationService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: LocalizationService }],
        });
        localizationService = TestBed.inject(LocalizationService);
    });

    it("create an instance", () => {
        const pipe = new LocalizePipe(localizationService);
        expect(pipe).toBeTruthy();
    });
});
