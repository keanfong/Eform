import React, { Suspense } from "react";
import { Redirect, Switch } from "react-router-dom";
import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout";
import MyPage from "./pages/MyPage";
import Dashboard from "./pages/dashboard/index.jsx";
import Forms from "./pages/forms/form.jsx";
import FormsList from "./pages/forms/forms-list.jsx";
import Activity from "./pages/activity/activity-view.jsx";
import Records from "./pages/records/record-view.jsx";
import Reports from "./pages/reports/report.jsx";
import Drafts from "./pages/drafts/draft-forms.jsx";
import NotFound from "./modules/Errors/not-found";

export default function BasePage() {
    return (
        <Suspense fallback={<LayoutSplashScreen />}>
            <Switch>
                {
                    /* Redirect from root URL to /dashboard. */
                    <Redirect exact from="/" to="/dashboard" />
                }
                <ContentRoute path="/dashboard" component={Dashboard} />
                <ContentRoute exact path="/forms/" component={FormsList} />
                <ContentRoute exact path="/forms/:formType" component={Forms} />
                <ContentRoute path={["/form/action/:formType/:id"]} component={Forms} />
                <ContentRoute exact path={["/pending", "/form/entries/action/:formType/:id",]} component={Activity} />
                <ContentRoute exact path={["/history", "/history/:historyType/:historyFormId"]} component={Records} />
                <ContentRoute exact path="/reports/:typeOfClaim" component={Reports} />
                <ContentRoute exact path="/drafts" component={Drafts} />
                <ContentRoute path="/profile" component={MyPage} />
                <ContentRoute path="/not-found" component={NotFound} />
            </Switch>
        </Suspense>
    );
}
