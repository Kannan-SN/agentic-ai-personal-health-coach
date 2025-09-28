import handleResponse from "../../lib/handleResponse";
import axios from "./Axios";

export const refreshToken = async () => {
  try {
    const response = await axios({
      url: "/auth/refresh-token",
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const signup = async (data) => {
  try {
    const response = await axios({
      url: "/auth/signup",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await axios({
      url: `/auth/email-verify/${token}`,
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const createPassword = async (data) => {
  try {
    const response = await axios({
      url: "/auth/create-password",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const signin = async (data) => {
  try {
    const response = await axios({
      url: "/auth/signin",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const signout = async () => {
  try {
    const response = await axios({
      url: "/auth/signout",
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const userInfo = async () => {
  try {
    const response = await axios({
      url: "/user/info",
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const acceptHealthDisclaimer = async (data) => {
  try {
    const response = await axios({
      url: "/user/health-disclaimer",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const createHealthProfile = async (data) => {
  try {
    const response = await axios({
      url: "/user/health-profile",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const getHealthProfile = async () => {
  try {
    const response = await axios({
      url: "/user/health-profile",
      method: "GET",
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const updateHealthProfile = async (data) => {
  try {
    const response = await axios({
      url: "/user/health-profile",
      method: "PUT",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const addEmergencyContact = async (data) => {
  try {
    const response = await axios({
      url: "/user/emergency-contact",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};

export const reportHealthConcern = async (data) => {
  try {
    const response = await axios({
      url: "/user/health-concern",
      method: "POST",
      data,
    });

    return handleResponse(response, "success");
  } catch (error) {
    return handleResponse(error, "error");
  }
};