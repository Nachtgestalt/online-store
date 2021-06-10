import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import BigNumber from 'bignumber.js';
/**
 * host: es requerido ya que si quitamos esto no muestra el dialog del calendar para input type date
 */
@Component({
  selector: 'ml-input-type',
  templateUrl: './input-type.component.html',
  styleUrls: ['./input-type.component.scss'],
  host: {
    style: `position: absolute;
	left: 0px; 
	top: 0px;
	background-color: transparant;
	` },
})
export class InputTypeComponent implements AfterViewInit {

  constructor() { }

  @ViewChild("textInput", { static: false }) textInput: ElementRef;

  public params: any;
  inputAttrs: any = {};

  agInit(params: any): void {
    this.params = params;

    if (params.inputAttrs) this.inputAttrs = params.inputAttrs;
  }

  getValue() {
    if (this.params.inputAttrs.type === 'number') {
      let inputBigNumber = new BigNumber(this.textInput.nativeElement.value);

      if (!!this.params.inputAttrs.decimalPlaces) {
        return inputBigNumber.decimalPlaces(this.params.inputAttrs.decimalPlaces);
      }
    }
    return this.textInput.nativeElement.value;
  }

  /** Se establece los atributos de control del input, por ejemplo, min, max, etc */
  setAttr(params) {
    if (params.inputAttrs) {
      if (params.inputAttrs.attrs) {
        for (const key in params.inputAttrs.attrs) {
          if (params.inputAttrs.attrs.hasOwnProperty(key)) {
            this.textInput.nativeElement.setAttribute(key, (params.inputAttrs.attrs as any)[key]);
          }
        }
      }
      if (params.inputAttrs.type) {
        // console.log(this.textInput)
        this.textInput.nativeElement.setAttribute('type', params.inputAttrs.type)
      }
    }

  }

  // public inputValidator(event: any) {

  //   let patt = new RegExp('^[0-9]+\\.?[0-9]*$');

  //   // str.slice(0, -1);
  //   let result = patt.test(event.target.value);
  //   console.log('event.key')
  //   console.log('result')
  //   console.log(event.target.value)
  //   console.log(result)
  //   return result;
  //   // }
  // }

  // isPopup(): boolean {
  // 	return true;
  // }

  ngAfterViewInit() {
    setTimeout(() => {

      if (this.params.cellStartedEdit) {
        this.setAttr(this.params);
      }

      /** Cuando se presional una tecla sobre la celda, si no tiene valor, por ejm. cuando presiona enter
       * entonces se selecciona el valor contenido, y si tiene un valor, ejm. presiona 5, entonces se escribe
       * ese valor y se pone el foco para seguir editando
       */
      if (!this.params.charPress) {
        this.textInput.nativeElement.select();
      } else {
        this.textInput.nativeElement.value = this.params.charPress;
        this.textInput.nativeElement.focus();
      }

    });
  }

}
