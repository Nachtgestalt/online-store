import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer, SafeHtml} from "@angular/platform-browser";

@Pipe({
  name: 'stock'
})
export class StockPipe implements PipeTransform {

  constructor(private sanitized: DomSanitizer) {
  }

  transform(value: number): SafeHtml {
    let stock: number = value;
    if (value <= 0) {
      return this.sanitized.bypassSecurityTrustHtml(
          "<span class='product-subtitle' style='color: red'>Agotado</div>"
      );
    } else {
      if (value % 1 != 0) {
        stock = +value.toFixed(2)
      }
      return this.sanitized.bypassSecurityTrustHtml(
          "<span class='product-subtitle' style='color: #065fd4; font-weight: bold'> " + stock + " en stock</div>");
    }
  }

}
