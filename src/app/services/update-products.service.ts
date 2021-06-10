import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UpdateProductsService {
  // Observable string sources
  private updateAnnouncedSource = new Subject<string>();
  // Observable string streams
  updateAnnounced$ = this.updateAnnouncedSource.asObservable();

  constructor() {
  }

  // Service message commands
  announceUpdateProducts(filter: string) {
    this.updateAnnouncedSource.next(filter);
  }
}
