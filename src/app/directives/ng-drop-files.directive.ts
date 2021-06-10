import {Directive, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {FileItem} from '../models/file-item';

@Directive({
  selector: '[appNgDropFiles]'
})
export class NgDropFilesDirective {

  @Input() archivos: FileItem[] = [];
  @Input() archivosConError: File[] = [];
  @Output() mouseSobre: EventEmitter<boolean> = new EventEmitter();

  constructor() {
  }

  @HostListener('dragover', ['$event'])
  public onDragEnter(event: any) {
    this.mouseSobre.emit(true);
    this._prevenirDetener(event);
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(event: any) {
    this.mouseSobre.emit(false);
  }

  @HostListener('drop', ['$event'])
  public onDrop(event: any) {

    const transferencia = this._getTransferencia(event);

    if (!transferencia) {
      return;
    }

    this._extraerArchivos(transferencia.files);

    this._prevenirDetener(event);
    this.mouseSobre.emit(false);

  }

  private _getTransferencia(event: any) {
    return event.dataTransfer ? event.dataTransfer : event.originalEvent.dataTransfer;
  }

  private _extraerArchivos(archivosLista: FileList) {


    // tslint:disable-next-line:forin
    for (const propiedad in Object.getOwnPropertyNames(archivosLista)) {
      this.archivosConError = [];
      const archivoTemporal = archivosLista[propiedad];

      if (this._archivoPuedeSerCargado(archivoTemporal)) {
        if (archivoTemporal.size < 3000000) {
          const nuevoArchivo = new FileItem(archivoTemporal);
          this.archivos.push(nuevoArchivo);
        } else {
          this.archivosConError.push(archivoTemporal)
        }

      }
    }
  }


  // Validaciones
  private _archivoPuedeSerCargado(archivo: File): boolean {

    if (!this._archivoYaFueDroppeado(archivo.name) && this._esImagen(archivo.type)) {
      return true;
    } else {
      return false;
    }

  }


  private _prevenirDetener(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  private _archivoYaFueDroppeado(nombreArchivo: string): boolean {

    for (const archivo of this.archivos) {

      if (archivo.nombreArchivo === nombreArchivo) {
        return true;
      }

    }

    return false;
  }

  private _esImagen(tipoArchivo: string): boolean {
    return (tipoArchivo === '' || tipoArchivo === undefined) ? false : tipoArchivo.startsWith('image');
  }


}
