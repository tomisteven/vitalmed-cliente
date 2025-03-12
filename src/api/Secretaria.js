import { ENV } from "../utils/constants";

export class SecretariaApi {
  url = ENV.URL + "/api/";

  async getSecretarias() {
    const response = await fetch(`${this.url}secretarias`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "vitalmed0258525",
      },
    });
    const data = await response.json();
    return data;
  }
}
