import { makeAutoObservable, runInAction } from "mobx";
import {
  login as apiLogin,
  signup as apiSignup,
  logout as apiLogout,
  setAuthToken,
} from "../api/server.js";

class AuthStore {
  token = localStorage.getItem("token") || "";
  user = JSON.parse(localStorage.getItem("user") || "null");
  loading = false;

  constructor() {
    makeAutoObservable(this);
    if (this.token) setAuthToken(this.token);
  }

  get isAuthenticated() {
    return !!this.token;
  }

  async login(email, password) {
    this.loading = true;
    try {
      const data = await apiLogin(email, password);
      runInAction(() => {
        this.token = data.token || "";
        this.user = data.user || null;
        localStorage.setItem("token", this.token);
        localStorage.setItem("user", JSON.stringify(this.user));
      });
      return { ok: true };
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async signup(payload) {
    this.loading = true;
    try {
      const data = await apiSignup(payload);
      runInAction(() => {
        // this.token = data.token || ''
        // this.user  = data.user  || null
        // localStorage.setItem('token', this.token)
        // localStorage.setItem('user', JSON.stringify(this.user))
        this.token = "";
        this.user = null;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      });
      return { ok: true, info: data?.message || "Welcome!" };
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  logout() {
    apiLogout();
    this.token = "";
    // this.user  = null
    // localStorage.removeItem('token')
    // localStorage.removeItem('user')
    localStorage.removeItem("token");
    this.setUser(null);
  }

  setUser(u) {
    this.user = u || null;
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  }
}

export const auth = new AuthStore();
