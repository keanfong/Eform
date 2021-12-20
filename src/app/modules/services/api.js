import { message, notification } from "antd";
import axios from "axios";
import { Redirect } from "react-router";

import { getAuthToken } from "./token.js";

const baseUrl = process.env.REACT_APP_API_URL;
// ||
// "https://iport-staging-backend.tekmarkgroup.com";
// "https://iport2-ctrl.tekmarkgroup.com";
// "https://staging-iport2-ctrl.tekmarkgroup.com/"

const headers = {
    Accept: "*/*",
    "Content-Type": "application/json; charset=utf-8",
};

export const login = async (
    username = "admin1",
    password = "",
    isRemeber = false
) => {
    const body = {
        username,
        password,
    };

    const response = await axios({
        url: `${baseUrl}/user/login/`,
        headers,
        data: JSON.stringify(body),
        method: "POST",
    })
        .then((data) => data.data)
        .then((data) => {
            return { success: true, accessToken: data?.token };

        })
        .catch((err) => {
            let returnData = { success: false, error: err };
            console.log(err);
            return returnData;
        });

    //If user remeber then set the token in cookie
    if (response.success) {
        let accessToken = response.accessToken;

        if (isRemeber) {
            localStorage.setItem("token", accessToken);
        } else {
            document.cookie = "";
            document.cookie = JSON.stringify({ token: accessToken });
        }
    }

    return response;
};

export const logout = async () => {
    localStorage.removeItem("token");
    document.cookie = "";
};

export const getUser = async () => {
    const token = await getAuthToken();

    const user = await fetch(`${baseUrl}/account/me/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return null;
        });

    return { user };
};


export const uploadProfileImage = async (data) => {
    const token = await getAuthToken();
    const user = await fetch(`${baseUrl}/account/profile-image-update/`, {
        headers: { Authorization: `Token ${token}` },
        body: data,
        method: "POST",
    })
        .then((resp) => resp.json().then(data => ({ status: resp.status, data: data })))
        .catch((e) => {
            console.log("Error occurred: ", e);
            return null;
        });

    return user;
}

export const getForm = async (formType) => {
    const token = await getAuthToken();

    const form = await fetch(`${baseUrl}/form/generator/${formType}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => {
            let isSuccess = false,
                results = null;

            if (resp?.status === 200 && resp?.ok) {
                isSuccess = true;
                results = resp.json();
            }

            return { isSuccess, results };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return { isSuccess: false, errorMessage: e };
        });

    return form;
};

export const getForms = async () => {
    const token = await getAuthToken();

    if (!token) return null;

    const forms = await fetch(`${baseUrl}/form/generator/published/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => {
            let results = null;

            if (resp?.status === 200 && resp?.ok) results = resp.json();

            return results;
        })
        .then((result) => {
            return { isSuccess: true, result };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return { isSuccess: false, errorMessage: e };
        });

    return forms;
};

export const getFormPendingForActions = async (data, endPoint) => {
    const token = await getAuthToken();

    let url = null;

    if (endPoint) {
        url = !data.submittedFor ? endPoint : endPoint + `&submitted_for=${data.submittedFor}`
    } else {
        const { status, pageNumber, pageSize, isNotEqual, username, searchValue } = data;

        if (status === "pending") {
            url = `form/entries/action/?status__in${isNotEqual ? "!" : ""
                }=${status}&page_size=${pageSize || 5}&page=${pageNumber ||
                1}&search=${searchValue ? encodeURIComponent(searchValue) : searchValue ||
                    ""}&submitted_for__username=${username || ""}`;
        } else {
            url = `form/entries/entrylist/?status_${isNotEqual ? "notin" : "in"
                }=${status}&page_size=${pageSize || 5}&page=${pageNumber ||
                1}&search=${searchValue ? encodeURIComponent(searchValue) : searchValue ||
                    ""}&submitted_for__username=${username || ""}`;
        }
    }

    const form = await fetch(`${baseUrl}/${url}`, {
        headers: { ...headers, Authorization: `Token ${token}` },
        method: "GET",
    }).then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });
    // console.log(form)
    return form;
};

export const getViewForm = async (formId, formType, url) => {
    const token = await getAuthToken();
    // console.log(formId,formType,url)


    const form = await fetch(`${baseUrl}/${url}/${formType}/${formId}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json().then(data => ({ status: resp.status, data: data })))
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};


export const deleteForm = async (formId, formType, url) => {
    const token = await getAuthToken();

    try {
        const res = await fetch(`${baseUrl}/${url}/${formType}/${formId}/`, {
            headers: {
                ...headers,
                Authorization: `Token ${token}`,
            },
            method: "DELETE",
        })
        return res;

    } catch (err) {
        throw err;
    }
};
export const apiCancelDraftFormWithRemark = async (formId, formType, url, data) => {
    const token = await getAuthToken();

    try {
        const res = await fetch(`${baseUrl}/${url}/${formType}/${formId}/`, {
            headers: {
                ...headers,
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
                ...data,
            }),
            method: "PATCH",
        })
        return res;

    } catch (err) {
        throw err;
    }
};

export const getPendingForSubmissions = async () => {
    const token = await getAuthToken();

    const form = await fetch(
        `${baseUrl}/form/entries/?status__in=pending,approved&page_size=5&search=&submitted_for__username=`,
        {
            headers: {
                ...headers,
                Authorization: `Token ${token}`,
            },
            method: "GET",
        }
    )
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const getClaimForm = async () => {
    const token = await getAuthToken();

    const form = await fetch(`${baseUrl}/form/generator/claim/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const getReport = async (data) => {
    const token = await getAuthToken();

    let urlString = `approvals__status=${data.approvals__status ||
        ""}&created__gte=${data.created__gte ||
        ""}&created__lte=${data.created__lte || ""}&claim_form_cycle=${data[
        "claim_form_cycle"
        ] || ""}&currency=${data.currency || ""}&company=${data.company ||
        ""}&financial_year=${data.financial_year || ""}`;

    const form = await fetch(`${baseUrl}/form/reports/claim/?${urlString}`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const getReportDateOptions = async () => {
    const token = await getAuthToken();

    const reportDate = await fetch(`${baseUrl}/form/reports/claim/date/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return reportDate;
};

export const generateClaimReport = async (data) => {
    const token = await getAuthToken();

    let urlString = `approvals__status=${data.approvals__status ||
        ""}&created__gte=${data.created__gte ||
        ""}&created__lte=${data.created__lte ||
        ""}&claim_cycle=${data.claim_cycle || ""}&currency=${data.currency ||
        ""}&company=${data.company || ""}`;

    const form = await fetch(`${baseUrl}/form/reports/claim/?${urlString}`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "POST",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const getAllNotifications = async (limit = 50) => {
    const token = await getAuthToken();

    const notifications = await fetch(`${baseUrl}/notifications/all/?limit=${limit}`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return null;
        });

    return notifications;
};

export const apiMarkAllNotificationsAsRead = async () => {
    const token = await getAuthToken();

    console.log(`${baseUrl}/notifications/all/`);

    const notifications = await fetch(
        `${baseUrl}/notifications/mark-all-as-read/`,
        {
            headers: {
                ...headers,
                Authorization: `Token ${token}`,
            },
            method: "GET",
        }
    )
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return null;
        });

    return { notifications };
};
export const apiMarkNotificationAsReadById = async (notificationId) => {
    // console.log(notificationId)
    const token = await getAuthToken();
    // console.log(`${baseUrl}/notifications/mark-as-read/:notification_id/`);
    const notifications = await fetch(`${baseUrl}/notifications/mark-as-read/${notificationId}/`, { headers: { ...headers, Authorization: `Token ${token}`, }, method: "GET" })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return null;
        });

    return { notifications };
};

export const exportClaimReport = async (data) => {
    const token = await getAuthToken();

    let urlString = `approvals__status=${data.approvals__status ||
        ""}&created__gte=${data.created__gte ||
        ""}&created__lte=${data.created__lte ||
        ""}&claim_cycle=${data.claim_cycle || ""}&currency=${data.currency ||
        ""}&company=${data.company || ""}`;

    const form = await fetch(
        `${baseUrl}/form/reports/claim/export/?${urlString}`,
        {
            headers: {
                ...headers,
                Authorization: `Token ${token}`,
            },
            method: "GET",
        }
    )
        .then((res) => res.blob())
        .then((blob) => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.style.display = "none";
            a.href = url;
            // the filename you want
            a.download = "Report.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const getCompute = async (data, endPoint, submitted_for_username) => {
    const token = await getAuthToken();
    // slip-form
    // console.log('getCompute', data, endPoint, submitted_for_username);

    const sendData = { data: data };
    if (submitted_for_username) {
        sendData["submitted_for_username"] = submitted_for_username;
    }
    const form = await fetch(`${baseUrl}${endPoint}`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify(sendData),
        method: "POST",
    })
        .then((resp) => resp.json())
        .then((res) => {
            return { success: true, results: res };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            // message.error(`Something went wrong ${e}`);
            // TODO: ask sin or tzermaan
            // notification.warn({ message: "Something went wrong", description: `${e}`, });
            return { success: false, error: e };
        });

    return form.results || null;
};

export const validateForm = async (data, endpoint) => {
    const token = await getAuthToken();

    const form = await fetch(`${baseUrl}${endpoint}`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
            data: data,
        }),
        method: "POST",
    })
        .then((resp) => resp.json())
        .then((res) => res)
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const saveNewAsDraft = async (data, formType) => {
    const token = await getAuthToken();

    return fetch(`${baseUrl}/form/entries/${formType}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
            data: data,
        }),
        method: "POST",
    })
        .then((resp) => resp.json())
        .then((data) => {
            return { isSuccess: true, data };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    // return fetch(`${baseUrl}/form/entries/${formType}/`, {
    //     headers: { ...headers, Authorization: `Token ${token}`, },
    //     body: JSON.stringify({ data: data, }),
    //     method: "POST",
    // }).then((response) => {
    //     if (response.ok) {
    //         console.log(response)
    //         return response.json();
    //     } else {
    //         console.log(response)
    //         throw new Error(response);
    //     }
    // }).then((data) => {
    //     return { isSuccess: true, data };
    // }).catch((e) => {
    //     console.log("Error occurred: ", e);
    //     throw new Error(e);
    // });
};

export const updateDraft = async (
    data,
    formType,
    formId,
    submitted_for_username
) => {
    const token = await getAuthToken();

    return fetch(`${baseUrl}/form/entries/${formType}/${formId}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
            data: data,
            submitted_for_username,
        }),
        method: "PUT",
    })
        .then((resp) => resp.json())
        .then((data) => {
            return { isSuccess: true, data };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    // return fetch(`${baseUrl}/form/entries/${formType}/${formId}/`, {
    //     headers: { ...headers, Authorization: `Token ${token}`, },
    //     body: JSON.stringify({ data: data, submitted_for_username, }),
    //     method: "PUT",
    // }).then((response) => {
    //     if (response.ok) {
    //         console.log(response)
    //         return response.json();
    //     } else {
    //         console.log(response)
    //         throw new Error(response);
    //     }
    // }).then((data) => {
    //     return { isSuccess: true, data };
    // }).catch((e) => {
    //     console.log("Error occurred: ", e);
    //     throw new Error(e);
    // });
};

export const checkClaimFormmPermission = async () => {
    const token = await getAuthToken();

    return fetch(`${baseUrl}/form/entries/user/form/submit/permission/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .then((data) => {
            return { isSuccess: true, data };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });
};
export const submitForm = async (
    data,
    submitted_for_username,
    formType,
    formId
) => {
    const token = await getAuthToken();

    return fetch(`${baseUrl}/form/entries/${formType}/${formId}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
            data: data,
            // status: 'pending'
        }),
        method: "POST",
    })
        .then((resp) => resp.json())
        .then((data) => {
            const response = { isSuccess: true, data };

            return response;
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });
};

export const getClaimBudget = async () => {
    const token = await getAuthToken();

    const budgets = await fetch(`${baseUrl}/credit/claim/personal/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return budgets;
};

export const uploadFormAttachments = async (
    data,
    setFileList,
    handleChange,
    field
) => {
    const token = await getAuthToken();
    const formType = data.formName;

    return {
        name: "file",
        action: `${baseUrl}/form/entries/${formType}/upload/`,
        headers: {
            authorization: `Token ${token}`,
        },
        data,
        multiple: true,
        // TODO:
        // multiple: false,
        // maxCount: 1,
    };
};

export const updateSlipData = async (slipId, data, slipUrl) => {
    const token = await getAuthToken();

    const slip = await fetch(`${baseUrl}/form/slip/${slipUrl}/${slipId}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        body: JSON.stringify({
            data: data,
        }),
        method: "PUT",
    })
        .then((resp) => resp.json())
        .then((res) => {
            let isSuccess = true,
                result = res;

            if (res.detail) {
                isSuccess = false;
                result = res.detail;
            }
            return { isSuccess, result };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return { isSuccess: false, error: e };
        });

    return slip;
};

export const getSlipData = async (slipId) => {
    const token = await getAuthToken();
    // slip-form: can be use for prefill data
    const slip = await fetch(`${baseUrl}/form/slip/amendment/${slipId}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => {
            return { isSuccess: true, result: resp.json() };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return { isSuccess: false, error: e };
        });

    return slip;
};

export const getLinkForm = async (linkEndPoint) => {
    const token = await getAuthToken();

    const linkForm = await fetch(`${baseUrl}/${linkEndPoint}/`, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .then((res) => {
            return { isSuccess: true, results: res.results };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return { isSuccess: false, error: e };
        });

    return linkForm;
};

export const submitActionForm = async (id, form, data) => {
    const token = await getAuthToken();

    const submitForm = await fetch(
        `${baseUrl}/form/entries/action/${form}/${id}/`,
        {
            headers: {
                ...headers,
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify(data),
            method: "POST",
        }
    )
        .then((resp) => resp.json())
        .then((res) => {
            return { isSuccess: true, results: res.results };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return { isSuccess: false, error: e };
        });

    return submitForm;
};

export const getSlipFormData = async (formType, valuesToPreFill) => {
    const token = await getAuthToken();
    // console.log('gone in slipformdata claim-amendment => ', formType, valuesToPreFill.id);
    // slip-form
    // FIXED: enabled only for claim amendment for now, waiting for api to start sending values
    let url = `${baseUrl}/form/generator/${formType}/`;
    if (
        valuesToPreFill?.id
        // && (formType === 'claim-amendment')
    ) {
        url += `?entry_id=${valuesToPreFill.id}`;
    }
    const form = await fetch(url, {
        headers: {
            ...headers,
            Authorization: `Token ${token}`,
        },
        method: "GET",
    })
        .then((resp) => resp.json())
        .then((res) => {
            return { isSuccess: true, results: res };
        })
        .catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return form;
};

export const getOrgCompanies = async () => {
    const token = await getAuthToken();

    const companies = await fetch(`${baseUrl}/organization/companies/`, {
        headers: { ...headers, Authorization: `Token ${token}` },
        method: "GET",
    }).then((resp) => resp.json())
        .then((res) => {
            return res;
        }).catch((e) => {
            console.log("Error occurred: ", e);
            return e;
        });

    return companies;
};

