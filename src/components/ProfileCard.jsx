import React from "react";

const ProfileCard = ({
  user,
  onMatch,
  onPass,
  onViewProfile,
  showActions = true,
}) => {
  // check if user exist
  if (!user) {
    return (
      <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-center text-slate-500">
        No user data available
      </div>
    );
  }

  const handleMatch = () => onMatch && onMatch(user);
  const handlePass = () => onPass && onPass(user);
  const handleViewProfile = () => onViewProfile && onViewProfile(user);

  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 overflow-hidden shadow-sm">
      {/* profile picture */}
      <div className="aspect-[4/3] bg-slate-100">
        <img
          src={user?.photoUrl || "/default-avatar.png"}
          alt={user?.fullName || "User"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.target.src = "/default-avatar.png";
          }}
        />
      </div>

      {/* user details*/}
      <div className="p-4 space-y-3">
        {/* name & age */}
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-semibold text-slate-900">
            {user?.fullName || "Unknown User"}
          </h3>
          {user?.age != null && (
            <span className="text-slate-600">· {user.age}</span>
          )}
          {typeof user?.distanceKm === "number" && (
            <span className="ml-auto text-sm text-slate-500">
              {user.distanceKm} km
            </span>
          )}
        </div>

        {/* bio*/}
        {user?.bio && (
          <p className="text-slate-700 text-sm leading-relaxed">{user.bio}</p>
        )}

        {/* tags - languages & goals */}
        <div className="flex flex-wrap gap-2">
          {(user?.languages || []).map((lang, index) => (
            <span
              key={`lang-${index}-${lang}`}
              className="rounded-full border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs text-slate-700"
            >
              {lang?.toUpperCase()}
            </span>
          ))}
          {(user?.goals || []).map((goal, index) => (
            <span
              key={`goal-${index}-${goal}`}
              className="rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-xs font-medium"
            >
              {goal}
            </span>
          ))}
        </div>

        {/* match/pass buttons*/}
        {showActions && (
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={handleMatch}
              className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-colors"
            >
              💚 Match
            </button>
            <button
              onClick={handlePass}
              className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-colors"
            >
              ✋ Pass
            </button>
            <button
              onClick={handleViewProfile}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-1 transition-colors"
            >
              👁️ View
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
