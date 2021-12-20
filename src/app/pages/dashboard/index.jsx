import React from "react";
import ProfileCard from "./profile-card.jsx";
import ClaimBudget from "./ClaimBudget.js";
// import PendingForm from "./pending-forms.jsx";
// import Activity from "./activity.jsx";


const Dashboard = () => {
	return (
		<>
			<div className="row dashboard-page col-md-12 col-sm-12">
				<div className="col-md-12 col-sm-12">
					<ProfileCard className="" />
				</div>

				<div className="col-md-12 col-sm-12 bg-white rounded">
					<ClaimBudget className="" />
				</div>

				{/* <div className="col-md-12 mt-12">
					<PendingForm status="pending" />
				</div> */}
			</div>
			<div className="row dashboard-page"></div>
                
            {/* </div> */}
			{/* <div className="d-flex col dashboard-page">
                    <Activity />
                </div> */}
		</>
	);
};

export default Dashboard;
