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
    entityKey: string | string[]
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
          typeof value === "object" && value && value.length !== undefined
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

  /**
   * Remove `__typename` fields recursively from an entity
   * @param entity Entity data
   */
  public static cleanTypenames<E = {}>(entity: E): E {
    return JSON.parse(
      JSON.stringify(entity, (key, value) => {
        if (key === "__typename") delete value[key];
        else return value;
      })
    );
  }

  /**
  *  Get last item of nested object
  */
  public getLastNested(object) {
    if (typeof object !== 'object') return object;
    for (const prop in object) return this.getLastNested(object[prop])
  }

  public setIdToNull(formGroup, field) {
    formGroup.get(field).patchValue({ id: null });
  }

  /**
  * Prints Zoom/fiches articles/tiers/documents
  */
  public onPrint(component?) {

    if (component?.accordion) {
      component.setAccordionDuration(0);
      component.openCloseAccordions(true);
    }
    const zoomMode = document.querySelector('.dx-popup-wrapper');
    let appRoot;
    let display;
    setTimeout(() => {
      // Different behaviour when zoom popup => app-root must be hidden to
      // avoid 2 print elements
      if (zoomMode) {
        const popup = document.querySelector(".dx-popup-wrapper");
        let previousEl = popup.previousElementSibling;
        while (previousEl) {
          if (previousEl.tagName === "APP-ROOT") {
            appRoot = previousEl;
            break;
          }
          previousEl = previousEl.previousElementSibling;
        }
        const style = getComputedStyle(appRoot);
        display = style.display;
        if (appRoot) appRoot.style.display = 'none';
      }
      const tempTitle = document.title;
      if (component?.printDocumentTitle) document.title = component.printDocumentTitle;
      window.print();
      document.title = tempTitle;
      if (appRoot) appRoot.style.display = display;
      if (component?.accordion) component.setAccordionDuration(300);
    }, 10); // Thanx Dx - otherwise accordions aren't opened
  }


  // Best user experience
  selectTextOnFocusIn(e: any) {
    const myInput = e.element?.querySelector("input.dx-texteditor-input");
    if (!myInput?.hasAttribute("readonly")) myInput?.select();
  }

  // Scroll left on selection (notably done for long texts in selectboxes)
  scrollLeftInputText(e: any) {
    const myInput = e.element?.querySelector("input.dx-texteditor-input");
    if (myInput?.value?.length) myInput?.setSelectionRange(0, 0);
  }

  // Compare two arrays (values & order)
  areEqual(array1: any[], array2: any[]) {
    return array1.length == array2.length && array1.every((element, index) => element === array2[index]);
  }

  // Get intersection between two arrays
  getIntersection(array1: any[], array2: any[]) {
    return array1.filter(value => array2.includes(value));
  }

  vowelTest(text) {
    return /^[AEIOUYaeiouy]$/i.test(text);
  }

  // Replace diacritics in a string
  noDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  isUpperCase(str) {
    return str === str.toUpperCase() && str !== str.toLowerCase();
  }

  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

}
