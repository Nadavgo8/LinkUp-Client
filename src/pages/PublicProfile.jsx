import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams} from "react-router-dom";
import { observer } from "mobx-react-lite";
import { getPublicProfile } from "../api/server.js";
import ProfileCard from "../components/ProfileCard.jsx";

function calcAge(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  const diff = Date.now() - d.getTime();
  return new Date(diff).getUTCFullYear() - 1970;
}

export default observer(function PublicProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchParams] = useSearchParams();
  const fromGoal = searchParams.get("goal");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getPublicProfile(id);
        if (!alive) return;
        setUser({
          ...data,
          age: data?.dob ? calcAge(data.dob) : null,
        });
      } catch (e) {
        setErr(e?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  if (loading) return <div className="p-6 text-center">Loading…</div>;
  if (err) return <div className="p-6 text-center text-red-600">{err}</div>;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => {
          if (window.history.length > 1) return nav(-1);
          nav(`/searchbuddy${fromGoal ? `?goal=${fromGoal}` : ""}`);
        }}
        className="rounded border px-3 py-1 text-sm hover:bg-slate-50"
      >
        ← Back
      </button>

      <ProfileCard user={user} showActions={false} />
    </div>
  );
});
