import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-association-articles-edi-colibri',
  templateUrl: './association-articles-edi-colibri.component.html',
  styleUrls: ['./association-articles-edi-colibri.component.scss']
})
export class AssociationArticlesEDICOLIBRIComponent {

  @Input() popup: boolean;
}
