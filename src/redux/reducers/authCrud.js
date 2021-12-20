
import { login, getUser } from '../../app/modules/services/api.js';

export const LOGIN_URL = "api/auth/login";

export const ME_URL = "api/me";

export function submitLogin(username, password) {
  return new Promise(async (resolve, reject) => {
    let loginResponse = await login(username, password).then(data => data);

    if (loginResponse.accessToken) resolve({ accessToken: loginResponse.accessToken });
    else reject(loginResponse);
  });
}

export function getUserByToken() {
  // Authorization head should be fulfilled in interceptor.
  return new Promise(async (resolve, reject) => {
    let user = await getUser().then(data => data.user);

    user = {
      "id": 1,
      "username": "Admin",
      "first_name": "Admin",
      "last_name": "Test",
      "roles": [
        "Test Action Role",
        "Claim Verifier",
        "Permit BU Change",
        "Permit Corporate Claim",
        "Permit Submitter Change"
      ],
      "profile": {
        "company": null,
        "business_unit": "TEST",
        "designation": null,
        "superior": null,
        "superior_of": "test.sharepoint 1 (TEKMARK),Test User 1"
      },
      "family_relations": ""
    }

    if (user) resolve({ user: user });
    else reject(user)
  });
}
