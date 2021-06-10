import {Component, OnInit} from '@angular/core';
import * as M from "materialize-css/dist/js/materialize";

@Component({
  selector: 'app-public',
  templateUrl: './public.component.html',
  styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit {

  ngOnInit() {
    var elems = document.querySelectorAll('.parallax');
    elems.forEach(element => {
      M.Parallax.init(element);  
    });
    
  
    var elems2 = document.querySelectorAll('.slider');
    elems2.forEach(element => {
      M.Slider.init(element);
    });
  }

}
