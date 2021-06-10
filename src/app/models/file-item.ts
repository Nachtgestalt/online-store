export class FileItem {

    public archivo: File;
    public nombreArchivo: string;
    public url: string;
    public estaSubiendo: boolean;
    public progreso: number;
    public ext: string

    constructor(archivo: File, ext?: string) {

        this.archivo = archivo;
        this.nombreArchivo = archivo.name;
        this.ext = ext

        this.estaSubiendo = false;
        this.progreso = 0;
    }

}
