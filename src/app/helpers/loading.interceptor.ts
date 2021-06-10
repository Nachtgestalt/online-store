import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {Observable} from "rxjs";
import {LoadingScreenService} from "../services/loading-screen.service";


@Injectable()
export class LoadingScreenInterceptor implements HttpInterceptor {
    private requests: HttpRequest<any>[] = [];

    constructor(private loadingScreenService: LoadingScreenService) {
    }

    removeRequest(req: HttpRequest<any>) {
        const i = this.requests.indexOf(req);
        if (i >= 0) {
            this.requests.splice(i, 1);
        }
        this.loadingScreenService.isLoading.next(this.requests.length > 0);
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.requests.push(request);
        this.loadingScreenService.isLoading.next(true);
        return new Observable(observer => {
            const subscription = next.handle(request)
                .subscribe(
                    event => {
                        if (event instanceof HttpResponse) {
                            this.removeRequest(request);
                            observer.next(event);
                        }
                    },
                    err => {
                        this.removeRequest(request);
                        observer.error(err);
                    },
                    () => {
                        this.removeRequest(request);
                        observer.complete();
                    });
            return () => {
                this.removeRequest(request);
                subscription.unsubscribe();
            }
        });

        // this.loadingScreenService.show();
        //
        //     return next.handle(request).pipe(
        //         finalize(() => {
        //             this.loadingScreenService.hide();
        //         })
        //     )
    }
}
