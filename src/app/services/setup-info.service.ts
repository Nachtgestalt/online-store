import {Injectable} from '@angular/core';
import {HttpBackend, HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {SetupInfo} from "../models/setupInfo.interface";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class SetupInfoService {

    private httpWithoutInterceptor: HttpClient;

    constructor(private http: HttpClient,
                private httpBackend: HttpBackend) {
        this.httpWithoutInterceptor = new HttpClient(httpBackend);
    }

    fetchSetupInfo(setupId) {
        return this.httpWithoutInterceptor.get<SetupInfo>(`${environment.BASE_URL}/setup-info/${setupId}`)
            .pipe(
                map((res: any) => {
                    let aboutUsUint = String.fromCharCode.apply(null, new Uint16Array(res.aboutUs.data));
                    let contactInfoUint = String.fromCharCode.apply(null, new Uint16Array(res.contactInfo.data));
                    let contactInfo = decodeURIComponent(escape(contactInfoUint));
                    let aboutUs = decodeURIComponent(escape(aboutUsUint));

                    return {
                        ...res,
                        aboutUs,
                        contactInfo
                    }
                })
            )
    }

    saveOrUpdate(setupInfo, setupId) {
        return this.http.post(`${environment.BASE_URL}/setup-info/${setupId}`, setupInfo)
    }

    saveLogo(logo, companyId) {
        const formData = new FormData();
        for (const item of logo) {
            formData.append('upload', item.archivo)
        }
        let params = new HttpParams().append('companyId', companyId);
        return this.http.post(`${environment.BASE_URL}/setup-info/logo`, formData, {params});
    }
}
