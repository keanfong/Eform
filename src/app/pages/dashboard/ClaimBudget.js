import React, { useState, useEffect } from "react";
import { getClaimBudget } from "../../modules/services/api";
import { useSelector, shallowEqual } from "react-redux";
import { checkHasAccessReports } from "../../../_metronic/_helpers";


const ClaimBudget = () => {
    const { user } = useSelector((state) => state.auth, shallowEqual);
    const [budgets, setBudgets] = useState();
    useEffect(() => {
        async function setClaimBudget() {
            const budget = await getClaimBudget();

            if (budget) {
                // budget[0].year = 2024;
                setBudgets(budget);
            };
        }

        const userRoles = user.roles || [];
        const hasAccess = checkHasAccessReports(userRoles);

        if (hasAccess) {
        setClaimBudget();
        }
    }, [user, setBudgets]);

    const getPercentage = (
    	amount = 0,
    	claimedAmount = 0,
    	pendingAmount = 0
    ) => {
    	let percentage = 0;

    	if (amount !== 0) {
    		percentage =
    			((claimedAmount + pendingAmount) / parseFloat(amount)) * 100;
    	}

    	return Math.round(percentage);
    };

    const getBudgetText = (period) => {
        let text = period;
        if (period) {
            if (period === "year") {
                text = "Yearly";
            } else if (period === "indefinite") {
                text = "One Time Budget";
            } else if (period === "case") {
                text = "Per Visit";
            }
        }
        return text;
    };

    const getYearText = (budget) => {
        // TODO: compare string with current financial year not the year directly
        const year = '' + budget?.year;
        if (budget?.year === budget?.previous_financial_year) {
            return `Previous Financial Year (FY${year?.slice(-2)})`;
        } else if (budget?.year === budget?.current_financial_year) {
            return `Current Financial Year (FY${year?.slice(-2)})`;
        }
        return `Financial Year ${year}`;
    }

    return (
        <div className="bg-white col-sm-12">
            <div className="card-header">
                <span className="text-dark-100 font-weight-bolder font-size-h3">
                    Claim Budgets
                </span>
            </div>
            <div className="card-body col-xl-12">
                <div className="row d-flex justify-content-around mb-sm-2" >
                    {budgets && budgets.length > 0 ? budgets.map((budget, index) => (
                        <div className="py-5 col-lg-12 col-md-12 col-sm-12 text-white rounded mb-2" key={index}>
                            {budget?.year && <h6 className='text-center' style={{ color: index === 0 ? "#2778b7" : "#1e3046" }}>{budget ? getYearText(budget) : ''}</h6>}
                            <table className="table table-responsive-md table-hover rounded text-white table-bordered" style={{ backgroundColor: index === 0 ? "#2778b7" : "#1e3046" }}>
                                <thead>
                                    <tr>
                                        <th scope='col'>Category</th>
                                        <th scope='col'>Period</th>
                                        <th scope='col'>Currency</th>
                                        <th scope='col'>Claimed Amount</th>
                                        <th scope='col'>Pending For Approval</th>
                                        <th scope='col'>Entitlement</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <th scope="row">Yearly Budget</th>
                                        <td>{getBudgetText(budget.period)}</td>
                                        <td>{budget.currency}</td>
                                        <td>{budget.claimed_amount}</td>
                                        <td>{budget.floating_amount}</td>
                                        <td>{budget.amount}</td>
                                    </tr>
                                    {budget?.allocations?.map((allocation, i) => (
                                        <tr key={i}>
                                            <th scope="row">{allocation?.claim_type?.name}</th>
                                            <td>{getBudgetText(allocation.claim_type.period)}</td>
                                            <td>{budget.currency}</td>
                                            <td>{allocation.claimed_amount}</td>
                                            <td>{allocation.floating_amount}</td>
                                            <td>{allocation.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )) : null}
                    {budgets && budgets.length > 0 ? budgets.map((budget, i) => (
                        <div key={i} className={"py-5 col-lg-5 col-md-12 col-sm-12 text-white rounded mb-2"} style={{ backgroundColor: i === 0 ? "#2778b7" : "#1e3046", }}>
                            <div className="d-flex justify-content-between">
                                <div className="">
                                    <b>
                                        {getBudgetText(budget.period)}
                                    </b>
                                </div>
                                <div className="">
                                    {budget.claimed_amount !== null ? budget.claimed_amount.toString() : ""} {budget?.floating_amount ? "(" + budget.floating_amount.toString() + ")/" : budget.claimed_amount !== null ? "/" : ""} {budget.amount} {budget.currency}
                                </div>
                            </div>

                            <hr />
                            {budget.allocations && budget.allocations.length > 0 ? budget.allocations.map((allocation, index) => (
                                <React.Fragment key={`allocation-key-${index}`}>
                                    {" "}
                                    <div className="d-flex justify-content-between my-8" key={index} >
                                        <div className="">
                                            <b>
                                                {allocation?.claim_type?.name}{" "}
                                                ({getBudgetText(allocation?.claim_type?.period)})
                                            </b>
                                        </div>
                                        <div className="">
                                            {allocation.claimed_amount !== null ? allocation.claimed_amount.toString() : ""}
                                            {allocation?.floating_amount ? "(" + allocation.floating_amount.toString() + ")/" : allocation.claimed_amount !== null ? "/" : ""}
                                            {allocation.amount}{" "} {budget.currency}
                                        </div>
                                    </div>
                                </React.Fragment>
                            )
                            )
                                : null}
                        </div>
                    ))
                        : ""}
                </div>
            </div>
        </div>
    );
};

export default ClaimBudget;
