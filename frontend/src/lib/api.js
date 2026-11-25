import axios from 'axios';
export const SOCKET_BASE=import.meta.env.VITE_API_URL||'http://localhost:3000';
// Production HTTP calls use Vercel's first-party proxy, so auth cookies remain on the site.
export const API_BASE=import.meta.env.PROD?window.location.origin:SOCKET_BASE;
axios.defaults.baseURL=API_BASE;
axios.defaults.withCredentials=true;
export const api=axios.create({baseURL:API_BASE,withCredentials:true,timeout:20000});
export const errorMessage=e=>e.response?.data?.error||e.message||'Request failed. Please try again.';
