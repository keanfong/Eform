/**
 * High level router.
 *
 * Note: It's recommended to compose related routes in internal router
 * components (e.g: `src/app/modules/Auth/pages/AuthPage`, `src/app/BasePage`).
 */

import React, { useEffect } from "react";
import { Redirect, Switch, Route } from "react-router-dom";
import { shallowEqual, useSelector, connect } from "react-redux";
import { Layout } from "../_metronic/layout";
import BasePage from "./BasePage";
import { AuthPage } from "../app/pages/home/home-page.jsx";
import NotFound from "./modules/Errors/not-found";
import { getAuthToken } from "../app/modules/services/token.js";
import * as auth from "../redux/reducers/user.reducer";
import { put } from 'redux-saga/effects'

const Routes = (props) => {
    const { isAuthorized } = useSelector(
        ({ auth }) => ({
            isAuthorized: auth.user != null,
            authToken: auth.authToken,
        }),
        shallowEqual
    );

    const token = getAuthToken();

    useEffect(() => {
        const iterator = getUser();
        iterator.next();
        // dispatch(props.requestUser());
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getUser = function* () {
        yield put(props.requestUser());
    }

    return (
        <Switch>
            {!(isAuthorized && token) ? (
                /*Render auth page when user at `/auth` and not authorized.*/
                <Route>
                    <AuthPage />
                </Route>
            ) : (
                /*Otherwise redirect to root page (`/`)*/
                <Redirect from="/auth" to="/" />
            )}

            <Route path="/error" component={NotFound} />
            {/* <Route path="/logout" component={Logout} /> */}

            {!isAuthorized ? (
                /*Redirect to `/auth` when user is not authorized*/
                <Redirect to="/auth/login" />
            ) : (
                <Layout>
                    <BasePage />
                </Layout>
            )}
        </Switch>
    );
}
export default (connect(null, auth.actions)(Routes));
