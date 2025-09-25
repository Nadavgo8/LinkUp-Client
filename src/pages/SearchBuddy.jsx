import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { discoverProfiles, decideOnUser } from "../api/server.js";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth } from "../stores/authStore.js";
import { toast } from 'react-hot-toast';

// same constants as in Profile
const GOALS = [
  { key: "dating", label: "Dating" },
  { key: "sports", label: "Sports" },
  { key: "language_practice", label: "Language Learning" },
  { key: "studies", label: "Studies" },
  { key: "hangout", label: "Hangout" },
];

// helper: calculate age from dob (ISO string / Date)
function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
}

export default observer(function SearchBuddy() {
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selected, setSelected] = useState(() => searchParams.get("goal"));
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loc, setLoc] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
       (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLoc({ lat, lng });

        // const res = await fetch(
        //   `/profile/discover?lat=${lat}&lng=${lng}&radius=20`
        // );
        // const data = await res.json();
        // console.log("Initial location test:", data);
      },
    //   (err) => console.error(err)
        (err) => {
        console.warn('Geolocation denied', err);
        setLoc(null);          
        }
    );
  }, []);

  // fetch people on goal change
  useEffect(() => {
    if (!selected) {
      setList([]);
      setError("");
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        console.log("👉 selected goal:", selected, "loc:", loc);
        const res = await discoverProfiles({
          goal: selected,
          lat: loc?.lat,
          lng: loc?.lng,
          radiusKm: 10,
        });
        console.log("Server response:", res);

        if (!alive) return;
        // res expected { count, users }
        const users = Array.isArray(res?.users) ? res.users : [];
        // add age field derived from dob
        const enriched = users
          .map((u) => ({
            ...u,
            age: u.dob ? calcAge(u.dob) : null,
          }))
          .filter((u) => u._id !== auth.user?._id);
        setList(enriched);
      } catch (e) {
        if (!alive) return;
        setError(e?.message || "Failed to search");
        setList([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [selected, loc?.lat, loc?.lng]);

  function chooseGoal(key) {
    setSelected(key);
    const next = new URLSearchParams(searchParams);
    if (key) next.set("goal", key);
    else next.delete("goal");
    setSearchParams(next, { replace: false });
  }

  // Pass
  const onPass = async (u) => {
    const prev = list;
    setList((p) => p.filter((x) => x._id !== u._id));
    try {
      await decideOnUser({ targetId: u._id, decision: "pass", goal: selected });
      toast('No worries — maybe next time!👌');
    } catch (e) {
      setList(prev);
      setError(e?.message || "Failed to send pass");
    }
  };

    // Match
  const onMatch = async (u) => {
    const prev = list;
    setList((p) => p.filter((x) => x._id !== u._id));
    try {
      const res = await decideOnUser({
        targetId: u._id,
        decision: "match",
        goal: selected,
      });

      const name = u.fullName || "user";
      toast.success(`Match sent to ${name}! 🎉
            We’ll let you know if it’s mutual. You control your connections.`);

      if (res?.matched) {
        toast.success(`It’s a match with ${name}! 🤝`);
        // optional: navigate to chat
        // nav(`/chats/${res.chatId}`)
      }
    } catch (e) {
      setList(prev);
      setError(e?.message || "Failed to send match");
    }
  };

  const onViewProfile = (u) => {
    const suffix = selected ? `?goal=${encodeURIComponent(selected)}` : "";
    nav(`/users/${u._id}${suffix}`);
  };

  const title = useMemo(() => {
    if (!selected) return "Pick a goal to discover people";
    const label = GOALS.find((g) => g.key === selected)?.label || selected;
    return `People near you for: ${label}`;
  }, [selected]);

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-0 space-y-6">
      {/* Goal filter bar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-wrap items-center gap-2">
          {GOALS.map((g) => {
            const active = selected === g.key;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => chooseGoal(g.key)}
                className={`rounded-full border px-3 py-1 text-sm transition
                  ${
                    active
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }
                  focus:outline-none focus:ring-2 focus:ring-indigo-300`}
              >
                {g.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results header */}
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="text-sm text-slate-500">
            {loc ? "within ~10 km" : "location off"}
          </div>
        </div>
      </div>

      {/* Results list */}
      <div className="grid gap-4 md:grid-cols-2">
        {loading && (
          <div className="p-6 text-center rounded-2xl bg-white ring-1 ring-black/5">
            Loading…
          </div>
        )}
        {!loading && !error && selected && list.length === 0 && (
          <div className="p-6 text-center rounded-2xl bg-white ring-1 ring-black/5">
            No people found.
          </div>
        )}
        {!loading && error && (
          <div className="p-6 text-center rounded-2xl bg-white ring-1 ring-red-200 text-red-700">
            {error}
          </div>
        )}

        {list.map((u) => (
          <article
            key={u._id}
            className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-sm"
          >
            <div className="aspect-[4/3] bg-slate-100">
              <img
                src={u.photoUrl || "/default-avatar.png"}
                alt={u.fullName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-4 space-y-2">
              <div className="flex items-baseline gap-2">
                <h3 className="text-xl font-semibold">{u.fullName}</h3>
                {u.age != null && (
                  <span className="text-slate-600">· {u.age}</span>
                )}
                {typeof u.distanceKm === "number" && (
                  <span className="ml-auto text-sm text-slate-500">
                    {u.distanceKm} km
                  </span>
                )}
              </div>
              {u.bio && <p className="text-slate-700 text-sm">{u.bio}</p>}

              <div className="flex flex-wrap gap-2">
                {(u.languages || []).map((l) => (
                  <span
                    key={l}
                    className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-700"
                  >
                    {l.toUpperCase()}
                  </span>
                ))}
                {(u.goals || []).map((g) => (
                  <span
                    key={g}
                    className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-xs"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => onMatch(u)}
                  className="flex-1 rounded bg-emerald-600 px-3 py-2 text-white hover:bg-emerald-700"
                >
                  Match
                </button>
                <button
                  onClick={() => onPass(u)}
                  className="flex-1 rounded bg-slate-200 px-3 py-2 text-slate-800 hover:bg-slate-300"
                >
                  Pass
                </button>
                <button
                  onClick={() => onViewProfile(u)}
                  className="rounded border px-3 py-2 text-slate-700 hover:bg-slate-50"
                >
                  View profile
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
});
