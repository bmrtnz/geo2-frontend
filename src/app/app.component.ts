import { Component, HostBinding } from '@angular/core';
import { ScreenService } from './shared/services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @HostBinding('class') get getClass() {
    return Object.keys(this.screen.sizes).filter(cl => this.screen.sizes[cl]).join(' ');
  }

  constructor(
    private screen: ScreenService,
  ) {

    // Clear blocage ligne ordre periodic survey
    window.sessionStorage.removeItem('surveyRunning');

    // Close columnchooser on outside click (non standard)
    document.addEventListener('mousedown', e => {
      const el = e.target;
      const context = el as HTMLElement;
      const context2 = context.closest('.dx-datagrid-column-chooser');
      if (!context2) {
        document.querySelectorAll('.dx-datagrid-column-chooser .dx-closebutton').forEach((btn) => {
          const closeBtn = btn as HTMLElement;
          if (this.isVisible(closeBtn.closest('.dx-datagrid-column-chooser'))) closeBtn.click();
        });
      }
     });

  }

  closest(elem, selector) {
    for (; elem && elem !== document; elem = elem.parentNode) {
      if (elem.matches(selector)) return elem;
    }
    return null;
  }

  isVisible(el) {
    const style = window.getComputedStyle(el);
    return ((style.display !== 'none') && (style.visibility !== 'hidden'));
}
}
