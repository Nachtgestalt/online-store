import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {IPersonData} from "../models/person-data.interface";
import {IAddress} from "../models/address.interface";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient) {
    }

    fetchAllUsers() {
        return this.http.get(`${environment.BASE_URL}/user`)
            .pipe(
                map((users: Array<any>) => {
                    return users.map((res: any) => {
                        let {personData, ...user} = res;
                        if (personData) {
                            let {id, ...res} = personData
                            personData = res;
                        }
                        return {
                            ...user,
                            ...personData
                        }
                    })
                })
            );
    }

    fetchUsersAreNotInSetup(setupId) {
        return this.http.get(`${environment.BASE_URL}/user/not-in-setup/${setupId}`)
            .pipe(
                map((users: Array<any>) => {
                    return users.map((res: any) => {
                        let {personData, ...user} = res;
                        let person;
                        if (personData) {
                            let {id, ...res} = personData
                            personData = res;
                        }
                        return {
                            ...user,
                            ...personData
                        }
                    })
                })
            );
    }

    getPersonData(userId) {
        return this.http.get<any>(`${environment.BASE_URL}/user/personData/${userId}`);
    }


    getBillingAddress(userId) {
        let params = new HttpParams().append('type', '1');
        params = params.append('id', `${userId}`);
        return this.http.get<any>(`${environment.BASE_URL}/user/address`, {params});
    }

    getDeliveryAddress(userId) {
        let params = new HttpParams().append('type', '2');
        params = params.append('id', `${userId}`);
        return this.http.get<any>(`${environment.BASE_URL}/user/address`, {params});
    }

    updatePersonData(personData) {
        let {id} = personData;
        return this.http.put<any>(`${environment.BASE_URL}/user/personData/${id}`, personData);
    }

    updateAddress(address) {
        let {id} = address;
        return this.http.put<any>(`${environment.BASE_URL}/user/address/${id}`, address);
    }

    registerPersonData(personData: IPersonData) {
        return this.http.post<any>(`${environment.BASE_URL}/user/personData`, personData);
    }

    registerBillingAddress(billingAddress: IAddress) {
        return this.http.post<any>(`${environment.BASE_URL}/user/address`, billingAddress);
    }

    registerDeliveryAddress(deliveryAddress: IAddress) {
        return this.http.post<any>(`${environment.BASE_URL}/user/address`, deliveryAddress);
    }
}
