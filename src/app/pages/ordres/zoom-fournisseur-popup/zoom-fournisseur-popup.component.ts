
import { AfterViewInit, Component, Input } from '@angular/core';
import { LocalizationService } from 'app/shared/services';

@Component({
  selector: 'app-zoom-fournisseur-popup',
  templateUrl: './zoom-fournisseur-popup.component.html',
  styleUrls: ['./zoom-fournisseur-popup.component.scss']
})

export class ZoomFournisseurPopupComponent implements AfterViewInit {

  @Input() public fournisseurLigneId: string;
  @Input() public fournisseurLigneCode: string;

  visible: boolean;
  title: string;

  constructor(
    private localizeService: LocalizationService
  ) { }

  ngAfterViewInit() {
  }

  setTitle(fournisseur) {
    this.title = this.localizeService.localize('zoom-fournisseur') + fournisseur;
  }

  onShowing(e) {
    e.component.content().parentNode.classList.add('zoom-fournisseur-popup');
  }

}


