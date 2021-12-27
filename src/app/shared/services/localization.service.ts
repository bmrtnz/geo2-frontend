import { Injectable } from '@angular/core';
import { formatDate, formatMessage, formatNumber, loadMessages, locale } from 'devextreme/localization';

import config from 'devextreme/core/config';

// @ts-ignore
import frDxMessage from 'devextreme/localization/messages/fr.json';
// @ts-ignore
import frMessage from '../../../assets/localization/messages/fr.json';

@Injectable({
  providedIn: 'root'
})
export class LocalizationService {

  constructor() {
    loadMessages(frDxMessage);
    loadMessages(frMessage);

    config({ defaultCurrency: 'EUR' });
    locale(navigator.language);
  }

  /**
   * Localize key string, date object and number object.
   *
   * @param value Key string or date or number to format.
   * @param args Can contain key string arguments or date and number format.
   */
  localize(value: any, ...args: any[]): string {
    if (typeof value === 'string') {
      return formatMessage(value, ...args);
    }
    if (value instanceof Date) {
      return formatDate(value, args[0] || 'shortDate');
    }
    if (typeof value === 'number') {
      return formatNumber(value, args[0] || 'decimal');
    }
  }
}
