import {Injectable} from '@angular/core';

/**
 * FakeService lazy load fake data from static exemple data file.
 */
@Injectable({
  providedIn: 'root'
})
export class FakeService {

  private readonly INVARIABLES = ['Pays', 'RegimeTva'];

  private cacheMap = new Map();

  constructor() { }

  async get<T>(type?: new () => T, id?: any) {
    const hasCache = this.cacheMap.has(type.name);
    let data = this.cacheMap.get(type.name);

    if (!hasCache) {
      let name = type.name.toLowerCase();

      if (!this.INVARIABLES.includes(type.name)) {
        name += 's';
      }

      data = (await import(`../data/${name}.ts`)).default as T[];
    }

    if (!hasCache) {
      this.cacheMap.set(type.name, data);
    }

    if (id) {
      return data.find(d => d.id === id);
    }

    return data;
  }
}
