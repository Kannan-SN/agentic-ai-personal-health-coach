const config = {
  SITE_NAME: "Wellness Coach",
  MODE: import.meta.env.VITE_MODE,
  USER_URL: import.meta.env.VITE_USER_URL || "http://localhost:5001/api",
  AGENT_URL: import.meta.env.VITE_AGENT_URL || "http://localhost:5000/api",
};

export default config;