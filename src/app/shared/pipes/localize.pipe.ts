import { Pipe, PipeTransform } from '@angular/core';
import { LocalizationService } from '../services';

/*
 * Transform value of key to localized value.
 *
 * Usage:
 *   value | localize:[format]
 * Example:
 *   {{ home.key | localize }}
*/
@Pipe({
  name: 'localize'
})
export class LocalizePipe implements PipeTransform {

  constructor(private localizationService: LocalizationService) {
  }

  transform(value: any, ...args: any[]): any {
    return this.localizationService.localize(value, args);
  }

}
