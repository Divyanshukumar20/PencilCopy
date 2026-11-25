
import React, { useEffect, useState } from "react";
import { api } from "../../../../lib/api";
import { Link, useNavigate } from "react-router-dom";

import Dummysidebar from "./Dummysidebar";
import Maincontent from "./Maincontent";

const Maincomplexnumbers = () => {
  const [currentTopicid, setCurrentTopicid] = useState(0);
  const [modules, setModules] = useState([]);
  const [access, setAccess] = useState(null);
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const navigate = useNavigate();

  const loadContent = async () => {
    setContentLoading(true);

    try {
      const response = await api.get(
        "/api/chapters/cn/content"
      );

      setModules(response.data);
      setCurrentTopicid(0);
    } catch {
      setError("Could not load chapter content");
    } finally {
      setContentLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const response = await api.get(
          "/api/chapters/cn/access"
        );

        if (cancelled) return;
        setAccess(response.data);

        const wallet = await api.get(
          "/api/chapters/wallet"
        );

        if (cancelled) return;
        setBalance(wallet.data.coins);

        if (response.data.unlocked) {
          const content = await api.get(
            "/api/chapters/cn/content"
          );

          if (!cancelled) {
            setModules(content.data);
          }
        }
      } catch (err) {
        if (cancelled) return;

        if ([401,403].includes(err.response?.status)) {
          navigate("/login");
        } else {
          setError("Could not load chapter access");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleUnlock = async () => {
    if (busy) return;

    setBusy(true);
    setError("");

    try {
      const response = await api.post(
        "/api/chapters/cn/unlock"
      );

      setBalance(response.data.coins);

      // Fetch the protected content before displaying it
      await loadContent();

      setAccess((prev) => ({
        ...prev,
        unlocked: true,
      }));
    } catch (err) {
      setError(
        err.response?.data?.error ||
        "Could not unlock chapter"
      );
    } finally {
      setBusy(false);
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#080e19] flex items-center justify-center text-white">
        Checking chapter access...
      </div>
    );
  }

  // Access check failed
  if (!access) {
    return (
      <div className="min-h-screen bg-[#080e19] text-red-400 p-10">
        {error}
      </div>
    );
  }

  // Locked chapter
  if (!access.unlocked) {
    return (
      <div className="min-h-screen bg-[#080e19] flex items-center justify-center p-6 text-white">
        <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-950 p-8 shadow-2xl">
          <div className="text-5xl mb-5">🔒</div>

          <h1 className="text-3xl font-bold mb-4">
            Complex Numbers
          </h1>

          <p className="text-slate-300 mb-4">
            Unlock this chapter permanently to
            access interactive notes and visualizations.
          </p>

          <div className="bg-slate-900 rounded-xl p-5 mb-5">
            <p className="text-slate-400">
              Unlock cost
            </p>
            <h2 className="text-2xl font-bold text-yellow-400">
              🪙 {access.coin_cost} coins
            </h2>

            <p className="mt-3 text-slate-300">
              Your balance: {balance ?? "..."} coins
            </p>
          </div>

          <button
            onClick={handleUnlock}
            disabled={busy}
            className="w-full bg-violet-600 hover:bg-violet-700 disabled:opacity-50 p-3 rounded-xl font-bold"
          >
            {busy ? "Unlocking..." : "Unlock Chapter"}
          </button>

          {error && (
            <p className="text-red-400 mt-4">
              {error}
            </p>
          )}

          <p className="text-slate-400 text-sm mt-4">
            Need more coins? <Link to="/store" className="text-violet-400 underline">Check the coin store</Link> for available packs.
          </p>

          <Link
            to="/chapters"
            className="block text-center text-violet-400 mt-5"
          >
            Browse Chapters
          </Link>
        </div>
      </div>
    );
  }

  if (contentLoading || !modules.length) {
    return (
      <div className="min-h-screen bg-[#080e19] text-white p-10">
        {error || "Loading chapter content..."}
      </div>
    );
  }

  // ORIGINAL DESIGN RESTORED
  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-[#080e19] overflow-x-hidden">

      {/* Original Sidebar */}
      <aside className="w-full md:w-[280px] lg:w-[320px] shrink-0">
        <Dummysidebar
          modules={modules}
          onTopicSelect={setCurrentTopicid}
        />
      </aside>

      {/* Original Main Content */}
      <div className="flex-1 min-w-0">
        <Maincontent
          id={currentTopicid}
          modules={modules}
        />
      </div>

    </div>
  );
};

export default Maincomplexnumbers;
