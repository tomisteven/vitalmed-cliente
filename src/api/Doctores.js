import { ENV } from "../utils/constants";

export class DoctoresApi {
  url = ENV.URL + "/api/";

  async getDoctores() {
    try {
      const response = await fetch(this.url + "doctores", {
        method: "GET",
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

  async updateDoctor(id, data) {
    try {
      const response = await fetch(this.url + `doctor/${id}`, {
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

  async createDoctor(data) {
    try {
      const response = await fetch(this.url + "doctor", {
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

  async deleteDoctor(id) {
    try {
      const response = await fetch(this.url + `doctor/${id}`, {
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
