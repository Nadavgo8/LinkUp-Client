import {
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  Navigate,
} from "react-router-dom";
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
import { Toaster } from 'react-hot-toast';

setErrorReporter((msg) => ui.pushError(msg));

export default observer(function App() {
  const nav = useNavigate();
  const handleLogout = () => {
    auth.logout();
    nav("/");
  };

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
                  className="whitespace-nowrap hover:text-indigo-600 text-slate-700"
                >
                  My connections
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
