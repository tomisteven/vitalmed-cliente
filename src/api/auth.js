import { ENV } from "../utils/constants";

export class AuthAPI {
  baseApi = ENV.BASE_PATH + "/auth";

  async loginForm(data) {
    try {
      const url = this.baseApi + "/login";
      const params = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      };
      const response = await fetch(url, params);
      const result = await response.json();
      if (response.status !== 200) {
        throw new Error(result.message);
      }
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
