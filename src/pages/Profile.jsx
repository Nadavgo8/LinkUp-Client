import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { auth } from "../stores/authStore.js";
import { getMyProfile, updateMe } from "../api/server.js";
import { calcAge } from "./PublicProfile.jsx";

const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// Fixed list of goals (keys saved in DB as 'goals')
const GOALS = [
  { key: "dating", label: "Dating" },
  { key: "sports", label: "Sports" },
  { key: "language_practice", label: "Language Learning" },
  { key: "studies", label: "Studies" },
  { key: "hangout", label: "Hangout" },
];

export default observer(function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fullName, setFullName] = useState(
    auth.user?.fullName || auth.user?.full_name || ""
  );
  const [email, setEmail] = useState(auth.user?.email || "");
  const [photoUrl, setPhotoUrl] = useState(auth.user?.photoUrl || "");
  const [bio, setBio] = useState(auth.user?.bio || "");
  const [goals, setGoals] = useState(
    Array.isArray(auth.user?.goals) ? auth.user.goals : []
  );

  const [occupation, setOccupation] = useState(auth.user?.occupation || "");
  const [company, setCompany] = useState(auth.user?.company || "");
  const [smoker, setSmoker] = useState(
    auth.user?.smoker || "prefer not to say"
  );
  const [relationshipStatus, setRelationshipStatus] = useState(
    auth.user?.relationshipStatus || "prefer not to say"
  );
  const [education, setEducation] = useState(auth.user?.education || "");
  const [interests, setInterests] = useState(
    Array.isArray(auth.user?.interests) ? auth.user.interests : []
  );
  const [city, setCity] = useState(auth.user?.city || "");
  const [dob, setDob] = useState(
    auth.user?.dob ? new Date(auth.user.dob).toISOString().slice(0, 10) : ""
  );

  const [isSaving, setIsSaving] = useState(false);

  //Edit profile
  const [editing, setEditing] = useState(false);

  // Load profile
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await getMyProfile();
        if (!alive) return;
        setFullName(data.fullName || data.full_name || "");
        setEmail(data.email || "");
        setPhotoUrl(data.photoUrl || "");
        setBio(data.bio || "");
        setGoals(Array.isArray(data.goals) ? data.goals : []);
        setOccupation(data.occupation || "");
        setCompany(data.company || "");
        setSmoker(data.smoker || "prefer not to say");
        setRelationshipStatus(data.relationshipStatus || "prefer not to say");
        setEducation(data.education || "");
        setInterests(Array.isArray(data.interests) ? data.interests : []);
        setCity(data.city || "");
        setDob(data.dob ? new Date(data.dob).toISOString().slice(0, 10) : "");
        auth.setUser(data);
      } catch (e) {
        setError(e?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      // prepare interests as array (if user typed a CSV when editing)
      const interestsToSend = Array.isArray(interests)
        ? interests
        : String(interests || "")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

      const body = {
        fullName,
        photoUrl,
        bio,
        occupation,
        company,
        smoker,
        relationshipStatus,
        education,
        interests: interestsToSend,
        city,
        dob: dob || undefined,
        goals,
      };

      const updated = await updateMe(body);
      auth.setUser(updated);
      // update local states with returned data (normalized)
      setFullName(updated.fullName || "");
      setPhotoUrl(updated.photoUrl || "");
      setBio(updated.bio || "");
      setOccupation(updated.occupation || "");
      setCompany(updated.company || "");
      setSmoker(updated.smoker || "prefer not to say");
      setRelationshipStatus(updated.relationshipStatus || "prefer not to say");
      setEducation(updated.education || "");
      setInterests(Array.isArray(updated.interests) ? updated.interests : []);
      setCity(updated.city || "");
      setDob(
        updated.dob ? new Date(updated.dob).toISOString().slice(0, 10) : ""
      );
      setGoals(Array.isArray(updated.goals) ? updated.goals : []);
      setEditing(false);
    } catch (e) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  }

  // Toggle a goal and SAVE
  async function toggleGoal(key) {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    const prev = goals;
    const next = prev.includes(key)
      ? prev.filter((k) => k !== key)
      : [...prev, key];
    setGoals(next);
    // PUT /user/profile { goals }
    try {
      const updated = await updateMe({ goals: next });
      setGoals(Array.isArray(updated?.goals) ? updated.goals : next);
      auth.setUser(updated);
    } catch (e) {
      // rollback on error
      setGoals(prev);
      setError(e?.message || "Failed to update goals");
    } finally {
      setIsSaving(false);
    }
  }

  if (loading) return <div className="py-10 text-center">Loading profile…</div>;

  return (
    <div className="mx-auto max-w-5xl px-2 md:px-0 space-y-6">
      {/* Profile header */}
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          {editing ? (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Profile"
                className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-1 ring-black/10"
              />
              <label className="absolute bottom-0 right-0 bg-indigo-600 text-white px-2 py-1 text-xs rounded cursor-pointer hover:bg-indigo-700">
                Change
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append("file", file);
                    formData.append("upload_preset", uploadPreset);
                    const res = await fetch(
                      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                      {
                        method: "POST",
                        body: formData,
                      }
                    );
                    const data = await res.json();
                    setPhotoUrl(data.secure_url);
                  }}
                />
              </label>
            </div>
          ) : (
            <img
              src={photoUrl}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover ring-1 ring-black/10"
            />
          )}

          <div>
            {editing ? (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="text-2xl font-bold border-b focus:outline-none"
              />
            ) : (
              <h1 className="text-3xl sm:text-4xl font-extrabold">{fullName}</h1>
            )}

            {editing ? (
              <p className="text-slate-600 text-sm sm:text-base break-all">{email}</p>
            ) : (
              <p className="text-slate-600 text-sm sm:text-base break-all">{email}</p>
            )}
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="w-full sm:w-auto sm:ml-auto self-stretch sm:self-auto rounded bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-700"
          >
            {editing ? "Cancel" : "Edit Profile"}
          </button>
        </div>
      </div>

      {/* Bio section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-lg font-semibold">Bio</h2>

        {editing ? (
          <textarea
            className="w-full min-h-28 rounded border p-2"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        ) : bio?.trim() ? (
          <p className="whitespace-pre-wrap text-slate-700">{bio}</p>
        ) : (
          <p className="text-slate-600 italic">No bio yet.</p>
        )}
      </div>

      {/* Additional details */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5 space-y-4">
        <h2 className="text-lg font-semibold">Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Occupation</label>
            {editing ? (
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            ) : occupation ? (
              <div className="mt-1 text-slate-700">{occupation}</div>
            ) : (
              <div className="mt-1 text-slate-500 italic">
                No occupation set
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Company</label>
            {editing ? (
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            ) : company ? (
              <div className="mt-1 text-slate-700">{company}</div>
            ) : (
              <div className="mt-1 text-slate-500 italic">No company</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">
              Relationship status
            </label>
            {editing ? (
              <select
                value={relationshipStatus}
                onChange={(e) => setRelationshipStatus(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              >
                <option value="prefer not to say">Prefer not to say</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="other">Other</option>
              </select>
            ) : (
              <div className="mt-1 text-slate-700">{relationshipStatus}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Smoker</label>
            {editing ? (
              <select
                value={smoker}
                onChange={(e) => setSmoker(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              >
                <option value="prefer not to say">Prefer not to say</option>
                <option value="no">No</option>
                <option value="yes">Yes</option>
                <option value="occasionally">Occasionally</option>
              </select>
            ) : (
              <div className="mt-1 text-slate-700">{smoker}</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Education</label>
            {editing ? (
              <input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            ) : education ? (
              <div className="mt-1 text-slate-700">{education}</div>
            ) : (
              <div className="mt-1 text-slate-500 italic">
                No education specified
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">City</label>
            {editing ? (
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            ) : city ? (
              <div className="mt-1 text-slate-700">{city}</div>
            ) : (
              <div className="mt-1 text-slate-500 italic">No city</div>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium">
              Interests (comma separated)
            </label>
            {editing ? (
              <input
                value={
                  Array.isArray(interests) ? interests.join(", ") : interests
                }
                onChange={(e) => setInterests(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            ) : Array.isArray(interests) && interests.length ? (
              <div className="mt-1 flex flex-wrap gap-2">
                {interests.map((it, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-indigo-50 text-indigo-700 px-2 py-0.5 text-xs"
                  >
                    {it}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-1 text-slate-500 italic">No interests</div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium">Date of birth</label>
            {editing ? (
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="mt-1 w-full rounded border p-2"
              />
            ) : (
              <div className="mt-1 text-slate-700">
                {dob ? `${dob} (${calcAge(dob)} y)` : "Not set"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Save button when editing */}
      {/* {editing && (
        <div className="text-right">
          <button
            onClick={async () => {
              try {
                setIsSaving(true);
                const updated = await updateMe({
                  fullName,
                  photoUrl,
                  bio,
                });
                auth.setUser(updated);
                setEditing(false);
              } catch (e) {
                setError(e?.message || "Failed to save profile");
              } finally {
                setIsSaving(false);
              }
            }}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )} */}

      {/* Save button */}
      {editing && (
        <div className="text-right">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}

      {/* Goals */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
        <h2 className="mb-3 text-lg font-semibold">Your goals</h2>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const active = goals.includes(g.key);
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => toggleGoal(g.key)}
                className={`rounded-full border px-3 py-1 text-sm transition
                        ${
                          active
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        }
                        focus:outline-none focus:ring-2 focus:ring-indigo-300`}
                title={g.key}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        {isSaving && (
          <div className="mt-3 text-sm text-slate-500">Saving your goals…</div>
        )}
        {error && <div className="mt-2 text-sm text-red-600">{error}</div>}
      </div>
    </div>
  );
});
