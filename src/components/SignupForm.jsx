import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { auth } from "../stores/authStore.js";

export default observer(function SignupForm() {
  const nav = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState("");

  function handlePhoto(e) {
    const f = e.target.files?.[0] || null;
    setPhotoFile(f);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(f ? URL.createObjectURL(f) : "");
  }
  useEffect(
    () => () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    },
    [photoPreview]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append("photo", photoFile);
      form.append("email", email);
      form.append("password", password);
      form.append("fullName", fullName);
      form.append("dob", dob);

      const res = await auth.signup(form);

      //   if (res?.error) setMessage(res.error);
      //   else { setMessage(""); nav("/"); }
      //   if (res?.error) {
      //     setMessage(res.error);
      //   } else {
      //     setMessage("");
      //     nav("/");
      //   }
      // } catch (err) {
      //   setMessage(err?.message || "Signup failed");
      //   const serverMsg = err?.response?.data?.msg;
      //   setMessage(serverMsg || err?.message || "Signup failed");
      // }

      if (res?.ok) {
        setMessage(res.info);
        setTimeout(() => {
          nav("/");
        }, 1500);
      } else {
        setMessage(res.error || "Signup failed");
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.msg;
      setMessage(serverMsg || err?.message || "Signup failed");
    }
  };

  const canSubmit = fullName && email && password && dob && !auth.loading;

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-md flex flex-col gap-4 rounded-2xl bg-white p-6 md:p-8 shadow-xl ring-1 ring-black/5"
    >
      <h2 className="text-center text-2xl font-extrabold">
        Create your LinkUp account
      </h2>

      {photoPreview ? (
        <img
          src={photoPreview}
          alt="preview"
          className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-indigo-200"
        />
      ) : (
        <div className="mx-auto h-20 w-20 rounded-full ring-2 ring-dashed ring-slate-200 grid place-items-center text-slate-400 text-sm">
          Photo
        </div>
      )}

      <input
        className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-200"
        placeholder="Full name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />
      <input
        className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-200"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-200"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        className="h-11 rounded-xl border border-slate-300 px-3 outline-none focus:ring-2 focus:ring-indigo-200"
        type="date"
        placeholder="Date of Birth"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
      />

      <label className="block">
        <span className="mb-1 block text-sm text-slate-600">Profile photo</span>
        <input
          className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-indigo-700 hover:file:bg-indigo-100"
          type="file"
          accept="image/*"
          onChange={handlePhoto}
        />
      </label>

      <button
        type="submit"
        // disabled={!canSubmit}
        className="w-full rounded-xl bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 disabled:opacity-60"
      >
        Sign Up
        {/* {auth.loading ? "Signing up…" : "Sign Up"} */}
      </button>

      <p className="text-center text-sm">
        <Link to="/" className="text-indigo-600 hover:underline">
          Already have an account? Log in
        </Link>
      </p>

      {message && <p className="text-center text-red-500 text-sm">{message}</p>}
    </form>
  );
});
