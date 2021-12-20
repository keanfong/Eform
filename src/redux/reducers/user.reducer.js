import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { put, takeLatest } from "redux-saga/effects";
import { getUserByToken } from "./authCrud";
import { getAuthToken } from '../../app/modules/services/token.js';


export const actionTypes = {
  Login: "[Login] Action",
  Logout: "[Logout] Action",
  UserRequested: "[Request User] Action",
  UserLoaded: "[Load User] Auth API",
  SetUser: "[Set User] Action",
  IsLoggedIn: "[Is Logged In] Action"
};

const initialAuthState = {
  user: undefined,
  authToken: getAuthToken(),
};

export const reducer = persistReducer(
  { storage, key: "v713-demo1-auth", whitelist: ["user", "authToken"] },
  (state = initialAuthState, action) => {
    switch (action.type) {
      case actionTypes.Login: {
        const { authToken, user } = action.payload;

        if (user) document.cookie = JSON.stringify({ token: authToken });

        return { authToken, user };
      }

      case actionTypes.Logout: {
        // TODO: Change this code. Actions in reducer aren't allowed.
        return initialAuthState;
      }

      case actionTypes.UserLoaded: {
        const { user } = action.payload;
        return { ...state, user };
      }

      case actionTypes.SetUser: {
        const { user } = action.payload;
        return { ...state, user };
      }

      case actionTypes.IsLoggedIn: {
        const { authToken = state.authToken } = action.payload;

        return { authToken };
      }

      default:
        return state;
    }
  }
);

export const actions = {
  login: (authToken, account) => ({ type: actionTypes.Login, payload: { authToken, user: account } }),
  isLoggedIn: () => ({ type: actionTypes.isLoggedIn }),
  logout: () => ({ type: actionTypes.Logout }),
  requestUser: (user) => ({
    type: actionTypes.UserRequested,
    payload: { user },
  }),
  fulfillUser: (user) => ({ type: actionTypes.UserLoaded, payload: { user } }),
  setUser: (user) => ({ type: actionTypes.SetUser, payload: { user } }),
};

export function* saga() {
  yield takeLatest(actionTypes.Login, function* loginSaga(action) {
    if (!action?.payload?.user) yield put(actions.requestUser());
    else yield put(actions.fulfillUser(action.payload.user));
  });

  yield takeLatest(actionTypes.IsLoggedIn, function* registerSaga() {
    yield put(actions.requestUser());
  });

  yield takeLatest(actionTypes.UserRequested, function* userRequested() {
    const { user } = yield getUserByToken();

    yield put(actions.fulfillUser(user));
  });
}
