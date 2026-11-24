import {createContext,useContext,useState,useEffect,useCallback} from 'react';
import {Navigate,useLocation} from 'react-router-dom';
import {api} from './api';
const AuthContext=createContext(null);
export function AuthProvider({children}) {
 const [user,setUser]=useState(null),[loading,setLoading]=useState(true);
 const refresh=useCallback(async()=>{try{const {data}=await api.get('/users/me');setUser(data);return data;}catch{setUser(null);return null;}finally{setLoading(false);}},[]);
 useEffect(()=>{refresh();window.addEventListener('auth:changed',refresh);return()=>window.removeEventListener('auth:changed',refresh);},[refresh]);
 const logout=async()=>{await api.post('/users/logout');setUser(null);};
 return <AuthContext.Provider value={{user,loading,refresh,logout}}>{children}</AuthContext.Provider>;
}
// Shared authentication state is intentionally exported alongside its provider.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth=()=>useContext(AuthContext);
export function Protected({children,admin=false}) {
 const {user,loading}=useAuth(),location=useLocation();
 if(loading)return <div className="pc-mvp">Checking your session…</div>;
 if(!user)return <Navigate to="/login" state={{from:location.pathname}} replace/>;
 if(admin&&user.role!=='admin')return <div className="pc-mvp">Admin access required.</div>;
 return children;
}
