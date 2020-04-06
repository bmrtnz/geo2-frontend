import { Component } from '@angular/core';
import { Company, ArticlesService } from '../../shared/services/articles.service';

@Component({
    selector: 'app-articles',
    templateUrl: './articles.component.html',
    styleUrls: ['./articles.component.scss'],
    providers: [ArticlesService],
    preserveWhitespaces: true
})
export class ArticlesComponent {
    companies: Company[];
    itemCount: number;

    constructor(service: ArticlesService) {
        this.companies = service.getCompanies();
        this.itemCount = this.companies.length;
    }
}
