const paramsEncoder = (params) => {
  return Object.keys(params)
    .map(key => {
      if (params[key] !== null && params[key] !== undefined) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      }
      return null;
    })
    .filter(Boolean)
    .join('&');
};

export default paramsEncoder;