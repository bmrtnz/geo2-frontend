import { Injectable } from '@angular/core';
import { FakeService } from './fake.service';
import { Article } from '../models';

export class Company {
    ID: number;
    CompanyName: string;
    Address: string;
    City: string;
    State: string;
    Zipcode: number;
    Phone: string;
    Fax: string;
    Website: string;
}

const companies: Company[] = [{
    ID: 1,
    CompanyName: 'Art (1)',
    Address: '702 SW 8th Street',
    City: 'Bentonville',
    State: 'Arkansas',
    Zipcode: 72716,
    Phone: '(800) 555-2797',
    Fax: '(800) 555-2171',
    Website: 'http://www.nowebsitesupermart.com'
}, {
    ID: 2,
    CompanyName: 'Art (2)',
    Address: '2455 Paces Ferry Road NW',
    City: 'Atlanta',
    State: 'Georgia',
    Zipcode: 30339,
    Phone: '(800) 595-3232',
    Fax: '(800) 595-3231',
    Website: 'http://www.nowebsitedepot.com'
}, {
    ID: 3,
    CompanyName: 'Art (3)',
    Address: '1000 Nicllet Mall',
    City: 'Minneapolis',
    State: 'Minnesota',
    Zipcode: 55403,
    Phone: '(612) 304-6073',
    Fax: '(612) 304-6074',
    Website: 'http://www.nowebsitemusic.com'
}, {
    ID: 4,
    CompanyName: 'Art (4)',
    Address: '999 Lake Drive',
    City: 'Issaquah',
    State: 'Washington',
    Zipcode: 98027,
    Phone: '(800) 955-2292',
    Fax: '(800) 955-2293',
    Website: 'http://www.nowebsitetomsclub.com'
}];

@Injectable({
    providedIn: 'root'
  })

  export class ArticlesService {

    constructor(
        private fakeService: FakeService
      ) { }

    getCompanies(): Company[] {
        return companies;
    }

    get(code?: string) {
        this.fakeService.get(Article, code).then(res => console.log(res));
        return this.fakeService.get(Article, code);
    }

}


