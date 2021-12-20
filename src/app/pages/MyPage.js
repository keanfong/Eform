/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { toAbsoluteUrl } from "../../_metronic/_helpers";
import { selectUserData } from "../../redux/selectors/form-selector.js";
import { createStructuredSelector } from "reselect";
import Snackbar from "@material-ui/core/Snackbar/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import * as auth from "../../redux/reducers/user.reducer";

import { uploadProfileImage } from '../modules/services/api'

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
};

const MyPage = ({ user, setUser }) => {
	// Fields
	const [pic, setPic] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [open, setOpen] = useState(false);
	const [msg, setMsg] = useState('');


	useEffect(() => {
		if (user?.profile?.profile_image) {
			setPic(user.profile.profile_image);
		}
	}, [user]);
	// Methods

	const getUserPic = () => {
		if (!pic) {
			return "none";
		}

		return `url(${pic})`;
	};

	const handleClose = (event, reason) => {
		if (reason === 'clickaway') {
		  return;
		}
	
		setOpen(false);
	};
	
	const submitImage = async () => {
		if(selectedFile){
			const formData = new FormData();
			formData.append("profile_image", selectedFile);
			const res = await uploadProfileImage(formData);
			if(res.status === 200){
				setUser(res.data);
				setMsg("Image Upload successfully");
			}else{
				setMsg(res.data.detail);
			}
			setOpen(true);
		}
	}

	
	return (
		<div className="row w-100">
			
			<Snackbar
				open={open}
				anchorOrigin={{
					horizontal: "right",
					vertical: "top",
				}}
				autoHideDuration={3000}
				onClose={handleClose}
			>
				<Alert severity="info">{msg}</Alert>
			</Snackbar>

			<div className="col-12 card mb-5 mb-xl-10">
				<div className="card-body pt-9 pb-0">
					<div className="d-flex flex-wrap flex-sm-nowrap mb-3">
						<div className="me-7 mb-4">
							<div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
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
										style={{
											backgroundImage: `${getUserPic()}`,
										}}
									/>
								</div>
								{/* <div className="position-absolute translate-middle bottom-0 start-100 mb-6 bg-success rounded-circle border border-4 border-white h-20px w-20px"></div> */}
							</div>
							
						</div>

						<div className="flex-grow-1">
							<div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
								<div className="d-flex flex-column">
									<div className="d-flex align-items-center mb-2">
										<span className="text-dark-100 font-weight-bolder font-size-h3 ml-5">
											{user.first_name
												? user.first_name
												: ""}{" "}
											{user.last_name
												? user.last_name
												: ""}
										</span>

										
									</div>

									<div className="d-flex flex-column mb-2">
										<input 
											type="file" 
											accept=".jpg, .jpeg, .png" 
											className="form-control ml-4 mb-2" 
											onChange={(e) => setSelectedFile(e.target.files[0])}
										/>
										<button 
											className="btn btn-info border border-white ml-4" 
											onClick={(e) => submitImage()}>
											Update Image
										</button>		
									</div>
											
									<div>
										<span className="text-muted font-weight-light font-size-base ml-5">
											{/* {
												user.email
											} */}
											{/* {user.roles.length > 0
												? user.roles[0]
												: ""} */}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="card mb-5 mb-xl-10" id="kt_profile_details_view">
				<div className="card-header cursor-pointer">
					<div className="card-title m-0">
						<h3 className="fw-bolder m-0">Profile Details</h3>
					</div>

					{/* <Link
						to="/crafted/account/settings"
						className="btn btn-primary align-self-center"
					>
						Edit Profile
					</Link> */}
				</div>

				<div className="card-body p-9">
					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Full Name
						</label>

						<div className="col-lg-8">
							<span className="fw-bolder fs-6 text-dark">
								{user.first_name ? user.first_name : ""}{" "}
								{user.last_name ? user.last_name : ""}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Username
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{user.username}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Email
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{user.email}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Company
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{(user?.profile?.company
									&& user.profile.company)
									|| "N/A"}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Business Unit
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{(user?.profile?.business_unit
									&& user.profile.business_unit)
									|| "N/A"}
							</span>
						</div>
					</div>
					
					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Designation
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{(user?.profile?.designation &&
									 user.profile.designation)
									|| "N/A"}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Family relations
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{user?.family_relations
									? user.family_relations.split(",").map((item, idx) => (
										<span key={idx} className="d-block">
											{item}
										</span>
									))
									: "N/A"}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Immediate Superior
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{(user?.profile?.superior
									&& user.profile.superior)
									|| "N/A"}
							</span>
						</div>
					</div>

					<div className="row mb-7">
						<label className="col-lg-4 fw-bold text-muted">
							Immediate Subordinates
						</label>

						<div className="col-lg-8 fv-row">
							<span className="fw-bold fs-6">
								{(user?.profile?.superior_of
									&& user.profile.superior_of)
									|| "N/A"}
							</span>
						</div>
					</div>

					{/* <div className="row mb-7">
								<label className="col-lg-4 fw-bold text-muted">
									Contact Phone
									<i
										className="fas fa-exclamation-circle ms-1 fs-7"
										data-bs-toggle="tooltip"
										title="Phone number must be active"
									></i>
								</label>

								<div className="col-lg-8 d-flex align-items-center">
									<span className="fw-bolder fs-6 me-2">
										044 3276 454 935
									</span>
								</div>
							</div> */}
				</div>
			</div>
		</div>
	);

	// return (
	// 	<>
	//   <div>
	//     <div className="col-lg-12 card mb-5 mb-xl-10">
	// 			<div className="card-body pt-9 pb-0">
	// 				<div className="d-flex align-items-center flex-wrap p-8 bgi-size-cover bgi-no-repeat rounded-top">
	// 					<div
	// 						className="image-input image-input-outline"
	// 						id="kt_profile_avatar"
	// 						style={{
	// 							backgroundImage: `url(${toAbsoluteUrl(
	// 								"/media/users/blank.png"
	// 							)}`,
	// 						}}
	// 					>
	// 						<div
	// 							className="image-input-wrapper"
	// 							style={{ backgroundImage: `${getUserPic()}` }}
	// 						/>
	// 					</div>
	// 					<div className="symbol bg-white-o-15 mr-3">
	// 						<div>
	// 							<span className="text-dark-100 font-weight-bolder font-size-h3 ml-5">
	// 								{user.first_name ? user.first_name : ""}{" "}
	// 								{user.last_name ? user.last_name : ""}
	// 							</span>
	// 						</div>
	// 						<div>
	// 							<span className="text-muted font-weight-light font-size-base ml-5">
	// 								{user.roles.length > 0 ? user.roles[0] : ""}
	// 							</span>
	// 						</div>
	// 					</div>
	// 				</div>
	// 			</div>
	// 		</div>
	//   </div>

	// 	</>
	// );
};

const mapStateToProps = createStructuredSelector({
	user: selectUserData,
});

export default connect(mapStateToProps,auth.actions)(MyPage);
