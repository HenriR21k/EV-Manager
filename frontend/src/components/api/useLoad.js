import { useState, useEffect } from "react";
import API from "./apiRequest.js";

export default function useLoad(endpoint) {
  const [records, setRecords] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState('Loading records ...');
  // Methods -------------------------------------
  const loadRecords = async (endpoint) => {  
  const response = await API.get(endpoint);
    setRecords(response.result) 

  }
  useEffect(() => { loadRecords(endpoint) }, []);
  return [records, setRecords, loadingMessage, loadRecords]
}