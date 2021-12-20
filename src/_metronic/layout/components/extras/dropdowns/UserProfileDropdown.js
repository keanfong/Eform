/* eslint-disable no-restricted-imports */
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { createStructuredSelector } from "reselect";
import SVG from "react-inlinesvg";

import Dropdown from "react-bootstrap/Dropdown";
import { toAbsoluteUrl } from "../../../../_helpers";
import { DropdownTopbarItemToggler } from "../../../../_partials/dropdowns";
import * as auth from "../../../../../redux/reducers/user.reducer.js";
import { selectUserData } from "../../../../../redux/selectors/form-selector.js";

const UserProfileDropdown = ({ logOut, user }) => {
	const [pic, setPic] = useState("");

	useEffect(() => {
		if (user?.profile?.profile_image) {
			setPic(user.profile.profile_image);
		}
	}, [user]);

	const getUserPic = () => {
		if (!pic) {
			return "none";
		}

		return `url(${pic})`;
	};

	return (
		<Dropdown drop="down" alignRight>
			<Dropdown.Toggle
				as={DropdownTopbarItemToggler}
				id="dropdown-toggle-user-profile"
			>
				<div
					className={
						"btn btn-icon w-auto btn-clean d-flex align-items-center btn-lg px-2"
					}
				>
					<span className="text-muted font-weight-bold font-size-base d-md-inline mr-1">
						Hi,
					</span>{" "}
					<span className="text-dark-50 font-weight-bolder font-size-base d-md-inline mr-3">
						{user.first_name ? user.first_name : ""}{" "}
						{user.last_name ? user.last_name : ""}
					</span>
				</div>
			</Dropdown.Toggle>
			<Dropdown.Menu className="p-0 m-0 dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-xl scroll">
				<>
					<div className="d-flex align-items-center flex-wrap p-8 bgi-size-cover bgi-no-repeat rounded-top">
						<div
							className="image-input image-input-outline"
							id="kt_profile_avatar"
							style={{
								backgroundImage: `url(${toAbsoluteUrl(
									"/media/users/blank.png"
								)}`,
							}}
						>
							<div
								className="image-input-wrapper"
								style={{ backgroundImage: `${getUserPic()}` }}
							/>
						</div>
						<div className="symbol bg-white-o-15 mr-3">
							<div>
								<span className="text-dark-100 font-weight-bolder font-size-base ml-5">
									{user.first_name ? user.first_name : ""}{" "}
									{user.last_name ? user.last_name : ""}
								</span>
							</div>
							{/* <div>
								<span className="text-muted font-weight-light small ml-5">
									{user.roles.length > 0 ? user.roles[0] : ""}
								</span>
							</div> */}
							<div>
								<div className="btn btn-icon btn-clean btn-xs ml-5">
									<span className="svg-icon svg-icon-xl svg-icon-primary">
										<SVG
											src={toAbsoluteUrl(
												"/media/svg/icons/Communication/Mail.svg"
											)}
										/>
									</span>
								</div>
								<span className="text-muted font-weight-light small ml-1">
									{user?.profile?.designation
										? user.profile.designation
										: "N/A"}
								</span>
							</div>
							<div className="navi-footer mt-2">
								<Link
									to="/auth/login"
									onClick={() => logOut()}
									className="btn btn-light-primary font-weight-bold ml-5 px-10"
								>
									Sign Out
								</Link>
							</div>
						</div>
					</div>
					<hr className="mx-8" />

					<div>
						<Link to="/profile" className="btn btn-clean d-block">
							<div className="d-flex p-5 align-items-center font-weight-bold">
								<div className="btn btn-icon btn-clean btn-lg">
									<span className="svg-icon svg-icon-xl svg-icon-success">
										<SVG
											src={toAbsoluteUrl(
												"/media/svg/icons/General/Notification2.svg"
											)}
										/>
									</span>
								</div>
								<div>
									<div className="d-flex justify-content-start">
										<span className="text-dark-50 font-weight-bolder font-size-base ml-3">
											My Profile
										</span>
									</div>
									<div className="d-flex justify-content-start">
										<span className="text-muted font-weight-light font-size-base ml-3 text-left">
											Account settings and more
										</span>
									</div>
								</div>
							</div>
						</Link>
					</div>
				</>
			</Dropdown.Menu>
		</Dropdown>
	);
};

const mapDispatchToProps = (dispatch) => ({
	logOut: () => dispatch(auth.actions.logout()),
});

const mapStateToProps = createStructuredSelector({
	user: selectUserData,
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(UserProfileDropdown);
