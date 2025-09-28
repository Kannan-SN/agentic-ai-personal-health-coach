const handleResponse = (response, type) => {
  try {
    if (type === "success" && response && response.data) {
      return response.data;
    } else if (
      type === "error" &&
      response &&
      response.response &&
      response.response.data
    ) {
      return response.response.data;
    } else {
      return {
        success: false,
        message: "Something went wrong",
      };
    }
  } catch (error) {
    return {
      success: false,
      message: "Something went wrong",
    };
  }
};

export default handleResponse;