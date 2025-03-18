import { ENV } from "../utils/constants";

export class AuthAPI {
  baseApi = ENV.URL + "/auth";

  async loginForm(data) {
    try {
      const url = this.baseApi + "/login";
      const params = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: data.usuario,
          password: data.password,
        }),
      };
      const response = await fetch(url, params);
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
