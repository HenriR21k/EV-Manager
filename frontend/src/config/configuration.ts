

const {
  REACT_APP_API_KEY,
  REACT_APP_MAP_KEY,
  REACT_APP_clientId,
} = process.env;

const configuration = {
    API: {
      API_KEY: REACT_APP_API_KEY,
      MAP_KEY: REACT_APP_MAP_KEY,
    },
    clientId: REACT_APP_clientId
   };
   
export default configuration;