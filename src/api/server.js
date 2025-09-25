const BASE = import.meta.env.VITE_SERVER_URL ?? "";

let token = localStorage.getItem("token") || "";

export function setAuthToken(newToken) {
  token = newToken || "";
  if (newToken) localStorage.setItem("token", newToken);
  else localStorage.removeItem("token");
}

let errorReporter = (msg) => {};
export function setErrorReporter(fn) {
  if (typeof fn === "function") errorReporter = fn;
}
function report(msg) {
  try {
    errorReporter(msg);
  } catch {}
}

async function req(path, { method = "GET", body, auth = true, headers } = {}) {
  const finalHeaders = { ...(headers || {}) };
  if (auth && token) finalHeaders.Authorization = `Bearer ${token}`;

  let payload = body;
  if (body && !(body instanceof FormData)) {
    finalHeaders["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(BASE + path, {
      method,
      headers: finalHeaders,
      body: payload,
    });
  } catch (e) {
    const msg = e?.message || "Network error";
    report(msg);
    throw new Error(msg);
  }

  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");

  // if (!res.ok) {
  //   let message = `Request failed (${res.status})`;
  //   try {
  //     message = isJson
  //       ? (await res.json())?.message || message
  //       : (await res.text()) || message;
  //   } catch {}
  //   report(message);
  //   throw new Error(message);
  // }

  // if (res.status === 204) return null;
  // return isJson ? res.json() : res.text();
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      if (isJson) {
        const data = await res.json();
        message =
          data.message ||
          data.msg ||
          (Array.isArray(data.errors)
            ? data.errors.map((e) => e.msg).join(", ")
            : null) ||
          message;
      } else {
        message = (await res.text()) || message;
      }
    } catch {}
    report(message);
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return isJson ? res.json() : res.text();
}

// --- Auth ---
export async function login(email, password) {
  const data = await req("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export async function signup(form) {
  const data = await req("/auth/register", {
    method: "POST",
    body: form,
    auth: false,
  });
  if (data?.token) setAuthToken(data.token);
  return data;
}

export function logout() {
  setAuthToken("");
}

// --- Profile ---
export async function getMyProfile() {
  return req("/user/profile");
}

export async function updateMe(body) {
  return req("/user/profile", { method: "PUT", body });
}

// --- Discover ---
export async function discoverProfiles({
  goal,
  lat,
  lng,
  radiusKm = 20,
  langs,
}) {
  const params = new URLSearchParams();
  if (goal) params.set("goal", goal);
  if (lat != null && lng != null) {
    params.set("lat", String(lat));
    params.set("lng", String(lng));
  }
  if (radiusKm) params.set("radius", String(radiusKm));
  if (langs)
    params.set("langs", Array.isArray(langs) ? langs.join(",") : langs);
  return req(`/profile/discover?${params.toString()}`);
}

// --- Connections ---
export async function decideOnUser({ targetId, decision, goal }) {
  if (!targetId) throw new Error("targetId required");
  return req(`/connections/${targetId}`, {
    method: "POST",
    body: { decision, goal },
  });
}

export async function getPublicProfile(userId) {
  return req(`/user/${userId}`, { method: "GET" });
}
