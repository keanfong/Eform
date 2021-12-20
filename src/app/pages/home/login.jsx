import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { connect } from "react-redux";
import { FormattedMessage, injectIntl } from "react-intl";
import * as auth from "./../../../redux/reducers/user.reducer.js";
import { submitLogin } from "./../../../redux/reducers/authCrud.js";
import MicrosoftLogin from "react-microsoft-login";
import configData from "../../modules/services/config.json";
/*
  INTL (i18n) docs:
  https://github.com/formatjs/react-intl/blob/master/docs/Components.md#formattedmessage
*/

/*
  Formik+YUP:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
*/

const initialValues = {
	name: "admin",
	password: "",
};

function Login(props) {
	const { intl } = props;
	const [loading, setLoading] = useState(false);
	const CLIENT_ID = configData?.MICROSOFT_APP_CONFIG?.appId || "";
	const REDIRECT_URL = window.location.origin;
    console.log('REDIRECT_URL =>', REDIRECT_URL)
	const LoginSchema = Yup.object().shape({
		name: Yup.string()
			.min(3, "Minimum 3 symbols")
			.max(50, "Maximum 50 symbols")
			.required(
				intl.formatMessage({
					id: "AUTH.VALIDATION.REQUIRED_FIELD",
				})
			),
		password: Yup.string()
			.min(3, "Minimum 3 symbols")
			.max(50, "Maximum 50 symbols")
			.required(
				intl.formatMessage({
					id: "AUTH.VALIDATION.REQUIRED_FIELD",
				})
			),
	});

	const enableLoading = () => {
		setLoading(true);
	};

	const disableLoading = () => {
		setLoading(false);
	};

	const getInputClasses = (fieldname) => {
		if (formik.touched[fieldname] && formik.errors[fieldname]) {
			return "is-invalid";
		}

		if (formik.touched[fieldname] && !formik.errors[fieldname]) {
			return "is-valid";
		}

		return "";
	};

	const authHandler = (_err, data) => {
		if (data) {
			disableLoading();
			props.login(data.accessToken, data.account);
		}
	};

	const loginSubmit = (values, { setStatus, setSubmitting }) => {
        console.log('REDIRECT_URL ->', REDIRECT_URL);
		setTimeout(() => {
			submitLogin(values.name, values.password)
				.then((data) => {
					disableLoading();
					props.login(data.accessToken);
				})
				.catch((_err) => {
					disableLoading();
					if (setSubmitting) setSubmitting(false);
					if (setStatus)
						setStatus(
							intl.formatMessage({
								id: "AUTH.VALIDATION.INVALID_LOGIN",
							})
						);
				});
		}, 1000);
	};

	const formik = useFormik({
		initialValues,
		validationSchema: LoginSchema,
		onSubmit: (values, otherParams) => {
			enableLoading();
			loginSubmit(values, otherParams);
		},
	});

	return (
		<div className="login-form login-signin" id="kt_login_signin_form">
			{/* begin::Head */}
			<div className="text-center mb-10 mb-lg-20">
				<h3 className="font-size-h1">
					<FormattedMessage id="AUTH.LOGIN.TITLE" />
				</h3>
				<p className="text-muted font-weight-bold">
					Enter your username and password
				</p>
			</div>
			{/* end::Head */}

			{/*begin::Form*/}
			<form
				onSubmit={formik.handleSubmit}
				className="form fv-plugins-bootstrap fv-plugins-framework"
			>
				{formik.status ? (
					<div className="mb-10 alert alert-custom alert-light-danger alert-dismissible">
						<div className="alert-text font-weight-bold">
							{formik.status}
						</div>
					</div>
				) : null}

				<div className="form-group fv-plugins-icon-container">
					<input
						placeholder="User name"
						type="username"
						className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
							"name"
						)}`}
						name="name"
						{...formik.getFieldProps("name")}
					/>
					{formik.touched.name && formik.errors.name ? (
						<div className="fv-plugins-message-container">
							<div className="fv-help-block">
								{formik.errors.name}
							</div>
						</div>
					) : null}
				</div>
				<div className="form-group fv-plugins-icon-container">
					<input
						placeholder="Password"
						type="password"
						className={`form-control form-control-solid h-auto py-5 px-6 ${getInputClasses(
							"password"
						)}`}
						name="password"
						{...formik.getFieldProps("password")}
					/>
					{formik.touched.password && formik.errors.password ? (
						<div className="fv-plugins-message-container">
							<div className="fv-help-block">
								{formik.errors.password}
							</div>
						</div>
					) : null}
				</div>
				<div className="form-group">

					<button
						id="kt_login_signin_submit"
						type="submit"
						disabled={formik.isSubmitting}
						className={`btn btn-primary font-weight-bold d-block  mx-auto rounded-0`}
                        style={loading ? {paddingRight: 30} : null}
					>
						<span>Sign In</span>
						{loading && (
							<span className="ml-3 spinner spinner-white"></span>
						)}
					</button>

					<hr className="hr-text" data-content="OR" />

					{/* <Link className="text-dark-50 text-hover-primary my-3 mr-2"> */}
					<MicrosoftLogin
						clientId={CLIENT_ID}
						redirectUri={REDIRECT_URL}
						authCallback={authHandler}
						className={`d-block mx-auto mt-2`}
					/>
					{/* </Link> */}



				</div>
			</form>
			{/*end::Form*/}
		</div>
	);
}

export default injectIntl(connect(null, auth.actions)(Login));
