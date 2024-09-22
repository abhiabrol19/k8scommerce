import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // We are on the server
    return axios.create({
      baseURL: 'http://ingress-external.default.svc.cluster.local',
      headers: req ? req.headers : {}
    });
  } else {
    // We are on the browser
    return axios.create({
      baseURL: '/'
    });
  }
};
