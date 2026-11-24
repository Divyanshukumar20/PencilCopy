// import { useCallback, useEffect, useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const api = axios.create({ baseURL: 'http://localhost:3000', withCredentials: true });

// /** Wrap an EXISTING chapter page without changing its JSX, CSS or navbar. */
// export default function ChapterAccessGate({ slug = 'cn', children }) {
//   const [access, setAccess] = useState(null);
//   const [coins, setCoins] = useState(null);
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [unlocking, setUnlocking] = useState(false);
//   const navigate = useNavigate();

//   const load = useCallback(async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const [accessResponse, walletResponse] = await Promise.all([
//         api.get(`/api/chapters/${encodeURIComponent(slug)}/access`),
//         api.get('/api/chapters/wallet'),
//       ]);
//       setAccess(accessResponse.data);
//       setCoins(walletResponse.data.coins);
//     } catch (err) {
//       if (err.response?.status === 401 || err.response?.status === 403) {
//         navigate('/login', { replace: true });
//       } else {
//         setError(err.response?.data?.error || 'Unable to check chapter access');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, [slug, navigate]);

//   useEffect(() => { load(); }, [load]);

//   async function unlock() {
//     if (unlocking) return;
//     setUnlocking(true);
//     setError('');
//     try {
//       const response = await api.post(`/api/chapters/${encodeURIComponent(slug)}/unlock`);
//       setCoins(response.data.coins);
//       setAccess(prev => ({ ...prev, unlocked: true }));
//     } catch (err) {
//       setError(err.response?.data?.error || 'Could not unlock chapter');
//       if (typeof err.response?.data?.coins === 'number') setCoins(err.response.data.coins);
//     } finally {
//       setUnlocking(false);
//     }
//   }

//   if (loading) return <div className="min-h-screen p-8">Checking chapter access...</div>;
//   if (error && !access) return <div className="min-h-screen p-8"><p role="alert">{error}</p><button type="button" onClick={load}>Retry</button></div>;
//   if (!access) return null;
//   if (access.unlocked) return children;

//   return (
//     <main className="min-h-screen bg-slate-950 text-white px-4 py-12">
//       <section className="mx-auto max-w-lg rounded-2xl bg-slate-900 border border-slate-700 p-8">
//         <h1 className="text-3xl font-bold">🔒 {access.title || 'Locked chapter'}</h1>
//         <p className="mt-4">Unlock permanently for <strong>{access.coin_cost} coins</strong>.</p>
//         <p className="mt-2">Your balance: <strong>{coins ?? '...'} coins</strong></p>
//         <button type="button" onClick={unlock} disabled={unlocking}
//           className="mt-6 rounded-lg bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500 disabled:opacity-50">
//           {unlocking ? 'Unlocking...' : 'Unlock chapter'}
//         </button>
//         {error && <p className="mt-3 text-rose-400" role="alert">{error}</p>}
//         <p className="mt-5 text-sm text-slate-400">Purchasing coins will be available after payment integration.</p>
//         <Link to="/chapters" className="mt-4 block underline">Back to chapters</Link>
//       </section>
//     </main>
//   );
// }
