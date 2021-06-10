import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ScrollContentService {
  // Observable string sources
  private scrollAnnouncedSource = new Subject<string>();
  // Observable string streams
  scrollAnnounced$ = this.scrollAnnouncedSource.asObservable();

  constructor() {
  }

  // Service message commands
  announceScroll(scroll: string) {
    this.scrollAnnouncedSource.next(scroll);
  }
}
