import {SetupInfo} from "../../models/setupInfo.interface";

export interface ISetupState {
    id: number | null;
    address?: string | null;
    companyId: number | null;
    companyAccount: string | null;
    bucketToImages: string | null;
    bodegaId: number | null;
    showStock: number | null;
    country: string | null;
    city: string | null;
    nombreComercial: string | null;
    slogan: string | null;
    status: number | null;
    logoName: string | null;
    osSetupInfos?: SetupInfo[] | null;
}

export const initialSetupState: ISetupState = {
    id: null,
    companyId: null,
    companyAccount: null,
    bucketToImages: null,
    bodegaId: null,
    city: '',
    country: '',
    logoName: null,
    nombreComercial: '',
    showStock: null,
    status: null,
    slogan: ''
}
