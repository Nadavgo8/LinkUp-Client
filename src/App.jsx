// import {
//   Routes,
//   Route,
//   NavLink,
//   Link,
//   useNavigate,
//   Navigate,
// } from "react-router-dom";
// import Home from "./pages/Home.jsx";
// import Signup from "./pages/Signup.jsx";
// import Profile from "./pages/Profile.jsx";
// import SearchBuddy from "./pages/SearchBuddy.jsx";
// import Connections from "./pages/Connections.jsx";
// import PublicProfile from "./pages/PublicProfile.jsx";
// import { ErrorBanner } from "./components/ErrorBanner.jsx";
// import { setErrorReporter } from "./api/server.js";
// import { ui } from "./stores/uiStore.js";
// import { observer } from "mobx-react-lite";
// import { auth } from "./stores/authStore.js";
// import { Toaster } from 'react-hot-toast';

// setErrorReporter((msg) => ui.pushError(msg));

// export default observer(function App() {
//   const nav = useNavigate();
//   const handleLogout = () => {
//     auth.logout();
//     nav("/");
//   };

//   return (
//     <div className="min-h-screen bg-slate-50">
//       <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
//         <div className="mx-auto max-w-7xl h-14 px-4 flex items-center gap-4">
//           <Link to="/" className="text-xl font-semibold text-indigo-600">
//             LinkUp
//           </Link>
//           <Toaster position="top-center" />
//           <nav className="ml-auto flex items-center gap-6 text-sm md:text-base">
//             {/* When NOT authenticated */}
//             {!auth.isAuthenticated && (
//               <>
//                 <NavLink
//                   to="/"
//                   className={({ isActive }) =>
//                     `whitespace-nowrap hover:text-indigo-600 ${
//                       isActive
//                         ? "text-indigo-600 font-medium"
//                         : "text-slate-700"
//                     }`
//                   }
//                 >
//                   Home
//                 </NavLink>
//                 <NavLink
//                   to="/signup"
//                   className={({ isActive }) =>
//                     `whitespace-nowrap hover:text-indigo-600 ${
//                       isActive
//                         ? "text-indigo-600 font-medium"
//                         : "text-slate-700"
//                     }`
//                   }
//                 >
//                   Register
//                 </NavLink>
//               </>
//             )}

//             {/* When authenticated */}
//             {auth.isAuthenticated && (
//               <>
//                 <NavLink
//                   to="/profile"
//                   className={({ isActive }) =>
//                     `whitespace-nowrap hover:text-indigo-600 ${
//                       isActive
//                         ? "text-indigo-600 font-medium"
//                         : "text-slate-700"
//                     }`
//                   }
//                 >
//                   My Profile
//                 </NavLink>

//                 <NavLink
//                   to="/searchbuddy"
//                   className={({ isActive }) =>
//                     `whitespace-nowrap hover:text-indigo-600 ${
//                       isActive
//                         ? "text-indigo-600 font-medium"
//                         : "text-slate-700"
//                     }`
//                   }
//                 >
//                   Search Buddy
//                 </NavLink>

//                 <NavLink
//                   to="/connections"
//                   className="whitespace-nowrap hover:text-indigo-600 text-slate-700"
//                 >
//                   My connections
//                 </NavLink>
//                 <button
//                   onClick={handleLogout}
//                   className="whitespace-nowrap rounded px-3 py-1 ring-1 ring-black/10 hover:bg-slate-50"
//                 >
//                   LOGOUT
//                 </button>
//                 {auth.user?.photoUrl && (
//                   <img
//                     src={auth.user.photoUrl}
//                     alt="me"
//                     className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
//                   />
//                 )}
//               </>
//             )}
//           </nav>
//         </div>
//       </header>

//       <main className="px-4 py-6">
//         <ErrorBanner />
//         <Routes>
//           <Route
//             path="/"
//             element={
//               auth.isAuthenticated ? (
//                 <Navigate to="/profile" replace />
//               ) : (
//                 <Home />
//               )
//             }
//           />
//           <Route path="/signup" element={<Signup />} />
//           <Route
//             path="/profile"
//             element={auth.isAuthenticated ? <Profile /> : <Home />}
//           />
//           <Route
//             path="/searchbuddy"
//             element={
//               auth.isAuthenticated ? (
//                 <SearchBuddy />
//               ) : (
//                 <Navigate to="/" replace />
//               )
//             }
//           />
//           <Route
//             path="/connections"
//             element={
//               auth.isAuthenticated ? (
//                 <Connections />
//               ) : (
//                 <Navigate to="/" replace />
//               )
//             }
//           />
//           <Route path="/users/:id" element={<PublicProfile />} />
//         </Routes>
//       </main>
//     </div>
//   );
// });

// src/App.jsx
import {
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";

import Home from "./pages/Home.jsx";
import Signup from "./pages/Signup.jsx";
import Profile from "./pages/Profile.jsx";
import SearchBuddy from "./pages/SearchBuddy.jsx";
import Connections from "./pages/Connections.jsx";
import PublicProfile from "./pages/PublicProfile.jsx";
import { ErrorBanner } from "./components/ErrorBanner.jsx";
import { setErrorReporter } from "./api/server.js";
import { ui } from "./stores/uiStore.js";
import { observer } from "mobx-react-lite";
import { auth } from "./stores/authStore.js";
import { Toaster } from "react-hot-toast";

setErrorReporter((msg) => ui.pushError(msg));

const API_BASE = (import.meta.env.VITE_SERVER_URL || "").replace(/\/+$/, "");
const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export default observer(function App() {
  const nav = useNavigate();
  const handleLogout = () => {
    auth.logout();
    nav("/");
  };

  // 🔴 minimal unread-dot state
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!auth.isAuthenticated || !STREAM_API_KEY) return;

    const client = StreamChat.getInstance(STREAM_API_KEY);
    let alive = true;

    (async () => {
      try {
        const me = {
          id: auth.user._id,
          name: auth.user.fullName,
          image:
            auth.user.photoUrl ||
            `https://getstream.io/random_svg/?name=${encodeURIComponent(
              auth.user.fullName || auth.user._id
            )}`,
        };

        // get a user token from your backend
        const res = await fetch(`${API_BASE}/api/stream/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: me.id,
            name: me.name,
            image: me.image,
          }),
        });
        const { token } = await res.json();

        await client.connectUser(
          { id: me.id, name: me.name, image: me.image },
          token
        );
        if (!alive) return;

        // initial state
        setHasUnread((client.user?.total_unread_count || 0) > 0);

        // update when counters change
        const update = (e) => {
          const count =
            typeof e.total_unread_count === "number"
              ? e.total_unread_count
              : client.user?.total_unread_count;
          setHasUnread((count || 0) > 0);
        };

        const subs = [
          client.on("notification.message_new", update),
          client.on("notification.mark_read", update),
          client.on("notification.channel_marked_read", update),
          client.on("connection.recovered", update),
          client.on("health.check", update),
        ];

        // cleanup event subscriptions
        return () => subs.forEach((s) => s.unsubscribe?.());
      } catch (err) {
        console.error("unread-dot init failed", err);
      }
    })();

    return () => {
      alive = false;
      client.disconnectUser().catch(() => {});
    };
  }, [auth.isAuthenticated]);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-7xl h-14 px-4 flex items-center gap-4">
          <Link to="/" className="text-xl font-semibold text-indigo-600">
            LinkUp
          </Link>
          <Toaster position="top-center" />
          <nav className="ml-auto flex items-center gap-6 text-sm md:text-base">
            {/* When NOT authenticated */}
            {!auth.isAuthenticated && (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `whitespace-nowrap hover:text-indigo-600 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-slate-700"
                    }`
                  }
                >
                  Home
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) =>
                    `whitespace-nowrap hover:text-indigo-600 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-slate-700"
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            )}

            {/* When authenticated */}
            {auth.isAuthenticated && (
              <>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `whitespace-nowrap hover:text-indigo-600 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-slate-700"
                    }`
                  }
                >
                  My Profile
                </NavLink>

                <NavLink
                  to="/searchbuddy"
                  className={({ isActive }) =>
                    `whitespace-nowrap hover:text-indigo-600 ${
                      isActive
                        ? "text-indigo-600 font-medium"
                        : "text-slate-700"
                    }`
                  }
                >
                  Search Buddy
                </NavLink>

                <NavLink
                  to="/connections"
                  className="relative whitespace-nowrap hover:text-indigo-600 text-slate-700"
                >
                  My connections
                  {hasUnread && (
                    <span className="absolute -right-3 -top-2 h-2 w-2 rounded-full bg-red-600" />
                  )}
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="whitespace-nowrap rounded px-3 py-1 ring-1 ring-black/10 hover:bg-slate-50"
                >
                  LOGOUT
                </button>
                {auth.user?.photoUrl && (
                  <img
                    src={auth.user.photoUrl}
                    alt="me"
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-black/10"
                  />
                )}
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="px-4 py-6">
        <ErrorBanner />
        <Routes>
          <Route
            path="/"
            element={
              auth.isAuthenticated ? (
                <Navigate to="/profile" replace />
              ) : (
                <Home />
              )
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/profile"
            element={auth.isAuthenticated ? <Profile /> : <Home />}
          />
          <Route
            path="/searchbuddy"
            element={
              auth.isAuthenticated ? (
                <SearchBuddy />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/connections"
            element={
              auth.isAuthenticated ? (
                <Connections />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route path="/users/:id" element={<PublicProfile />} />
        </Routes>
      </main>
    </div>
  );
});
