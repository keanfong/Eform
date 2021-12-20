/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect, useState } from "react";

import { toAbsoluteUrl } from "../../../_metronic/_helpers";

import { shallowEqual, useSelector } from "react-redux";
import RandomQuote from "./random-quote.jsx";

const ProfileCard = () => {
	const user = useSelector(({ auth }) => auth.user, shallowEqual);
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
		<>
			{user && (
				<div className="row">
					<div className="col-sm-12 bg-white mb-5 mb-xl-10 rounded">
						<div className="card-body pt-9 pb-0">
							<div className="d-flex flex-wrap flex-sm-nowrap mb-3 align-items-center">
								<div
									className="image-input image-input-outline ml-7"
									id="kt_profile_avatar"
									style={{
										backgroundImage: `url(${toAbsoluteUrl(
											"/media/users/blank.png"
										)}`,
                                        backgroundSize: 'contain'
									}}
								>
									<div
										className="image-input-wrapper"
										style={{
											backgroundImage: `${getUserPic()}`,
											height: "175px",
											width: "175px",
										}}
									/>
								</div>

								<div className="col-xl-8">
									<div className="mb-2">
										<div className="">
											<div className="mb-2">
												<span className="text-dark-100 font-weight-bolder font-size-h3 ml-5">
													{user.first_name
														? user.first_name
														: ""}{" "}
													{user.last_name
														? user.last_name
														: ""}
												</span>
											</div>
											<div>
												<div className="row mb-2">
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															Username:
														</span>
													</div>
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															{user.username}
														</span>
													</div>
												</div>

												<div className="row mb-2">
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															Designation:
														</span>
													</div>
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															{
																(user?.profile
																	?.designation && user.profile.designation) || 'N/A'
															}
														</span>
													</div>
												</div>

												<div className="row mb-2">
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
                                                        Company:
														</span>
													</div>
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															{
																(user?.profile?.company && user.profile.company) || 'N/A'
															}
														</span>
													</div>
												</div>

												<div className="row mb-2">
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															Business Unit:
														</span>
													</div>
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															{
																(user?.profile?.business_unit && user.profile.business_unit) || 'N/A'
															}
														</span>
													</div>
												</div>

												<div className="row mb-2">
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															Superior:
														</span>
													</div>
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															{
																(user?.profile?.superior && user.profile.superior) || 'N/A'
															}
														</span>
													</div>
												</div>

												<div className="row mb-2">
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															Email:
														</span>
													</div>
													<div className="col-5 d-flex justify-content-start">
														<span className="text-dark-100 ml-5 text-muted">
															{
																user.email
															}
														</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<hr />
						<div className="col-12 d-flex justify-content-center py-5">
							<RandomQuote className="" />
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default ProfileCard;
