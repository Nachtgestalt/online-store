import {createAction, props} from "@ngrx/store";
import {ISetup} from "../../models/setup.interface";

export enum ESetupActions {
    SET_SETUP = '[Setup] Set company setup',
}

export const SetSetup = createAction(ESetupActions.SET_SETUP, props<{ setup: ISetup }>());
