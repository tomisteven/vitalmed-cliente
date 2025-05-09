import { ENV } from "../utils/constants";

export class PacienteApi {
  url = ENV.URL + "/api/";

  async getDocumentos(id) {
    try {
      const response = await fetch(this.url + `paciente/${id}/documentos`, {
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

  async eliminarArchivo(id, idArchivo) {
    try {
      const response = await fetch(
        this.url + `secretaria/${id}/eliminar-documento/${idArchivo}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "vitalmed0258525",
          },
        }
      );
      const result = await response.json();
      if (response.status !== 200) {
        console.log(result.message);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async getDoctoresList() {
    try {
      const response = await fetch(this.url + "/doctores/list", {
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

  async eliminarDoctor(idPaciente, idDoctor) {
    try {
      const response = await fetch(
        this.url + `paciente/${idPaciente}/eliminar-doctor`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "vitalmed0258525",
          },
          body: JSON.stringify({ idDoctor }),
        }
      );
      const result = await response.json();
      if (response.status !== 200) {
        console.log(result.message);
      }
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async asignarDoctores(id, data) {
    try {
      const response = await fetch(this.url + `paciente/${id}/asignar-doctor`, {
        method: "POST",
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

  async agregarNota(id, data) {
    try {
      const response = await fetch(this.url + `paciente/${id}/agregar-nota`, {
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

  async updatePaciente(id, data) {
    try {
      const response = await fetch(this.url + `paciente/${id}`, {
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

  async createPaciente(data) {
    try {
      const response = await fetch(this.url + "paciente", {
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

  async getPacientes() {
    try {
      const response = await fetch(this.url + "pacientes", {
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

  async descargarArchivo(nombreArchivo) {
    try {
      const response = await fetch(this.url + `/descargar/${nombreArchivo}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "vitalmed0258525",
        },
      });
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async getPacienteById(id) {
    try {
      const response = await fetch(this.url + `paciente/${id}`, {
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

  async getDoctores(id) {
    try {
      const response = await fetch(this.url + `paciente/${id}/doctores`, {
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

  async subirDocumento(id, formData) {
    try {
      const response = await fetch(this.url + `secretaria/${id}/subir`, {
        method: "POST",
        headers: {
          contentType: "multipart/form-data",
          Authorization: "vitalmed0258525",
        },
        body: formData,
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

  async deletePaciente(id) {
    try {
      const response = await fetch(this.url + `paciente/${id}`, {
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
