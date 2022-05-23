import { Injectable } from "@angular/core";
import { AbstractControl } from "@angular/forms";

@Injectable({
    providedIn: "root",
})
export class FormUtilsService {
    constructor() { }

    /**
     * Filter dirty controls and map them to their field value
     * @param controls Form controls
     * @param entityKey Entity key field name
     */
    public extractDirty(
        controls: { [key: string]: AbstractControl },
        entityKey: string | string[],
    ) {
        const clean = (value) => {
            if (value && value.__typename)
                for (const field of Object.keys(value))
                    if (field !== entityKey) delete value[field];
            return value;
        };
        return Object.entries(controls)
            .filter(([key, control]) => key === entityKey || control.dirty)
            .map(([key, control]) => {
                const value = JSON.parse(JSON.stringify(control.value));
                const cleanValue =
                    typeof value === "object" &&
                        value &&
                        value.length !== undefined
                        ? (value as []).map((v) => clean(v))
                        : clean(value);
                return { [key]: cleanValue };
            })
            .reduce((acm, current) => ({ ...acm, ...current }));
    }

    /**
     * Map entity to field path list
     * @param entity Entity data
     * @param prefix Path prefix
     */
    public extractPaths(entity: {}, prefix = ""): string[] {
        return Object.entries(entity).flatMap(([key, value]) => {
            if (typeof value === "object" && value !== null) {
                if (length in value) return this.extractPaths(value[0], key);
                return this.extractPaths(value, key);
            }
            return `${prefix ? `${prefix}.` : ""}${key}`;
        });
    }

    public setIdToNull(formGroup, field) {
        formGroup.get(field).patchValue({ id: null });
    }

}
