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

  async updateSecretaria(id, data) {
    try {
      const response = await fetch(this.url + `secretaria/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.status !== 200) {
        console.log(result.message);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async createSecretaria(data) {
    try {
      const response = await fetch(this.url + "secretaria", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (response.status !== 201) {
        console.log(result.message);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async deleteSecretaria(id) {
    try {
      const response = await fetch(this.url + `secretaria/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
      });

      const result = await response.json();
      if (response.status !== 200) {
        console.log(result.message);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
