import {createReducer, on} from "@ngrx/store";
import {SetSetup} from "../actions/setup.actions";
import {initialSetupState} from "../state/setup.state";

const _setupReducer = createReducer(initialSetupState,
    on(SetSetup, (state, {setup}) => {
        return {
            ...state,
            ...setup
        }

    })
);

export function setupReducer(state, action) {
    return _setupReducer(state, action);
}
