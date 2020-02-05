import {Injectable} from '@angular/core';
import {Client} from '../models/client';
// @ts-ignore
import clients from '../data/clients.json';
import {from} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  private readonly data: [Client];

  constructor(
    ) {
    this.data = clients;
  }

  public get(id?: string) {
    if (id) {
      return from([this.data.find(c => c.id === id)]);
    }

    return from(this.data);
  }

}
