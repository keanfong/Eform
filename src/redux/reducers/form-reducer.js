// import { persistReducer } from "redux-persist";
// import storage from "redux-persist/lib/storage";
// import { put, takeLatest } from "redux-saga/effects";
// import { getUserByToken } from "./authCrud";
import * as actionTypes from "../actions/action-type.js"

export const form = (state = {}, action) => {
  switch (action.type) {

    case actionTypes.UPDATE_FORM_DATA: {
      return {
        ...state,
        formData: action.payload
      }
    }

    case actionTypes.UPDATE_FIELD_VALUE: {
      return {
        ...state,
        fields: action.payload
      }
    }

    case actionTypes.UPDATE_TABLE_FIELD_VALUE: {
      return {
        ...state,
        tableFields: action.payload
      }
    }

    case actionTypes.UPDATE_TALLY_FIELD_VALUE: {
      return {
        ...state,
        tallyFields: action.payload
      }
    }

    case actionTypes.RESET_TOTAL_FORM_DATA: {
      return {}
    }

    default:
      return state;
  }
}

// export const actions = {
//   login: (authToken) => ({ type: actionTypes.Login, payload: { authToken } }),
//   register: (authToken) => ({
//     type: actionTypes.Register,
//     payload: { authToken },
//   }),
//   logout: () => ({ type: actionTypes.Logout }),
//   requestUser: (user) => ({
//     type: actionTypes.UserRequested,
//     payload: { user },
//   }),
//   fulfillUser: (user) => ({ type: actionTypes.UserLoaded, payload: { user } }),
//   setUser: (user) => ({ type: actionTypes.SetUser, payload: { user } }),
// };

// export function* saga() {
//   yield takeLatest(actionTypes.Login, function* loginSaga() {
//     yield put(actions.requestUser());
//   });

//   yield takeLatest(actionTypes.Register, function* registerSaga() {
//     yield put(actions.requestUser());
//   });

//   yield takeLatest(actionTypes.UserRequested, function* userRequested() {
//     const {user} = yield getUserByToken();

//     yield put(actions.fulfillUser(user));
//   });
// }
