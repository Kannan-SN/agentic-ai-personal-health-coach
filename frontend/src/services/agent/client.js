import handleResponse from "../../lib/handleResponse";
import axios from "./Axios";

export const sendChat = async (data, id) => {
  try {
    const response = await axios({
      url: `/user/health-plan/${id}/chat`,
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const getChatHistory = async (id) => {
  try {
    const response = await axios({
      url: `/user/health-plan/${id}/messages`,
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const updatePlanProgress = async (id, data) => {
  try {
    const response = await axios({
      url: `/user/health-plan/${id}/progress`,
      method: "PUT",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const pausePlan = async (id) => {
  try {
    const response = await axios({
      url: `/user/health-plan/${id}/pause`,
      method: "POST",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const getHealthDisclaimer = async () => {
  try {
    const response = await axios({
      url: "/user/health-disclaimer",
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};