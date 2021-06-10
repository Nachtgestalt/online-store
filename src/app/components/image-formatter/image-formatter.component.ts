import {Component} from '@angular/core';

@Component({
  selector: 'app-image-formatter',
  template: `<img border="0" width="50" height="50" src=\"{{ params.value }}\">`,
  styleUrls: ['./image-formatter.component.scss']
})
export class ImageFormatterComponent {

  params: any;

  agInit(params: any) {
    this.params = params;
  }
}
