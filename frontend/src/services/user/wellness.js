import handleResponse from "../../lib/handleResponse";
import axios from "./Axios";

export const createWellnessPlan = async (data) => {
  try {
    const response = await axios({
      url: "/user/wellness-plan",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const getWellnessPlans = async () => {
  try {
    const response = await axios({
      url: "/user/wellness-plans",
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const getWellnessPlanById = async (id) => {
  try {
    const response = await axios({
      url: `/user/wellness-plan/${id}`,
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
      url: `/user/wellness-plan/${id}/progress`,
      method: "PUT",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const pauseWellnessPlan = async (id, data) => {
  try {
    const response = await axios({
      url: `/user/wellness-plan/${id}/pause`,
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const resumeWellnessPlan = async (id, data) => {
  try {
    const response = await axios({
      url: `/user/wellness-plan/${id}/resume`,
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};