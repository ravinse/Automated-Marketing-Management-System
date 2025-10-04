import React, { useState } from "react";

// LoginPage.jsx
// Single-file React component styled with Tailwind CSS.
// Usage: import LoginPage from './LoginPage'; then render <LoginPage /> inside your app.

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email) return "Email is required.";
    // simple email regex (client-side only)
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!re.test(email)) return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 900));
      // In a real app: call your auth endpoint here and handle response
      // Example: const result = await fetch('/api/login', { method: 'POST', body: JSON.stringify({email,password}) })

      // temporary success behaviour
      alert(`Logged in as ${email} (remember: ${remember})`);
      setEmail("");
      setPassword("");
      setRemember(false);
    } catch (err) {
      setError("Unexpected error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-white to-rose-50 p-6">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left - Illustration / Branding */}
        <div className="hidden md:flex flex-col justify-center px-6">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg">YK</div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">Welcome back</h2>
                <p className="text-sm text-gray-500">Sign in to continue to your dashboard</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-sm shadow-lg">
            <h3 className="font-medium text-gray-700 mb-3">Why sign in?</h3>
            <ul className="text-sm text-gray-600 space-y-2 list-inside list-disc">
              <li>Access your projects and settings</li>
              <li>Sync preferences across devices</li>
              <li>Secure, private data storage</li>
            </ul>
          </div>

          <p className="mt-6 text-xs text-gray-400">By signing in you agree to our Terms of Service and Privacy Policy.</p>
        </div>

        {/* Right - Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-gray-800">Sign in to your account</h1>
            <p className="text-sm text-gray-500 mt-1">Use your email and password or continue with a social provider.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md p-3">{error}</div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
                aria-label="Email address"
              />
            </label>

            <label className="block relative">
              <span className="text-sm font-medium text-gray-700">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-1 block w-full rounded-lg border border-gray-200 px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                required
                aria-label="Password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-gray-600">Remember me</span>
              </label>

              <a href="#" className="text-indigo-600 hover:underline">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 font-semibold text-white shadow hover:opacity-95 disabled:opacity-60"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
              ) : null}
              <span>{loading ? "Signing in..." : "Sign in"}</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-xs text-gray-400">or continue with</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium">
                {/* Google Icon (simple) */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                  <path fill="#EA4335" d="M24 10.2v7.8h13.6C36.9 21.6 30.9 26 24 26c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.3 0 6.3 1.3 8.4 3.4L24 10.2z" />
                </svg>
                Google
              </button>

              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium">
                {/* GitHub Icon (simple) */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                  <path fill="currentColor" d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.38 7.86 10.9.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.73.08-.72.08-.72 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.76.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.72 0-1.26.45-2.29 1.2-3.1-.12-.29-.52-1.45.11-3.02 0 0 .98-.31 3.2 1.19.93-.26 1.92-.39 2.9-.39s1.97.13 2.9.39c2.22-1.5 3.2-1.19 3.2-1.19.63 1.57.23 2.73.11 3.02.75.81 1.2 1.85 1.2 3.1 0 4.45-2.71 5.42-5.29 5.71.42.36.79 1.08.79 2.18 0 1.58-.01 2.86-.01 3.25 0 .31.21.67.8.56C20.71 21.38 24 17.08 24 12c0-6.35-5.15-11.5-12-11.5z" />
                </svg>
                GitHub
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don&apos;t have an account? <a href="#" className="text-indigo-600 font-medium hover:underline">Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}
