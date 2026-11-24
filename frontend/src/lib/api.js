import axios from 'axios';
export const API_BASE=import.meta.env.VITE_API_URL||'http://localhost:3000';
axios.defaults.baseURL=API_BASE;
axios.defaults.withCredentials=true;
export const api=axios.create({baseURL:API_BASE,withCredentials:true,timeout:20000});
export const errorMessage=e=>e.response?.data?.error||e.message||'Request failed. Please try again.';
