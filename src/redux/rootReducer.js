import { all } from "redux-saga/effects";
import { combineReducers } from "redux";

import { form } from "./reducers/form-reducer.js";

import * as auth from "./reducers/user.reducer.js";
import headerSlice from "./reducers/header.reducer.js";


export const rootReducer = combineReducers({
    auth: auth.reducer,
    header: headerSlice,
    form
});

export function* rootSaga() {
    yield all([auth.saga()]);
}
