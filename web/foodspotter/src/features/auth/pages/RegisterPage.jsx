import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth";
import RegisterForm from "../components/RegisterForm";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(email);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const firstname = form.firstname.trim();
    const lastname = form.lastname.trim();
    const email = form.email.trim();
    const password = form.password;

    if (!firstname || !lastname || !email || !password) {
      setError("All fields are required.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await register({ firstname, lastname, email, password });
      const accessToken = res?.data?.accessToken;
      const user = res?.data?.user;

      if (!accessToken || !user) {
        throw new Error("Invalid registration response from server.");
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const errData = err.response?.data?.error;
      if (errData?.details && typeof errData.details === "object") {
        const msgs = Object.values(errData.details).join(", ");
        setError(msgs);
      } else {
        setError(
          errData?.details ||
            errData?.message ||
            err.message ||
            "Registration failed.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(251,191,36,0.22),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(251,146,60,0.18),_transparent_34%),linear-gradient(135deg,_#fffaf5_0%,_#ffffff_46%,_#f8fafc_100%)] px-4 py-8 sm:px-6 lg:px-10">
      <div className="absolute right-[-5rem] top-[-5rem] h-72 w-72 rounded-full bg-amber-300/35 blur-3xl" />
      <div className="absolute left-[-5rem] bottom-[-6rem] h-80 w-80 rounded-full bg-orange-300/25 blur-3xl" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-[linear-gradient(160deg,_#f97316_0%,_#fb923c_38%,_#f59e0b_100%)] p-10 text-white">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-white" />
              Join FoodSpotter
            </div>

            <div className="space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 shadow-lg backdrop-blur-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                  Create your path
                </p>
                <h1 className="mt-3 max-w-sm text-4xl font-black leading-tight tracking-tight">
                  Make your FoodSpotter profile and start saving what you love.
                </h1>
                <p className="mt-4 max-w-md text-sm leading-7 text-orange-50/90">
                  Register once and keep track of your favorite stalls,
                  restaurants, and go-to spots anywhere you browse.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Fast setup
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Create your account in a few steps.
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Personal picks
                </p>
                <p className="mt-2 text-sm font-semibold">
                  Tailor your experience to your preferences.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-white/15 pt-6 text-sm text-orange-50/90">
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-white/80" />
              Built for food explorers
            </div>
            <div className="flex items-center gap-3">
              <span className="h-2 w-2 rounded-full bg-white/80" />
              Keeps your favorites in one place
            </div>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <div className="mb-8 flex lg:hidden items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.7}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  FoodSpotter
                </p>
                <p className="text-xs text-gray-500">Create your account</p>
              </div>
            </div>

            <div className="mb-8 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                Start here
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight text-gray-900">
                  Create your account
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Join FoodSpotter and start building your food trail.
                </p>
              </div>
            </div>

            {success && (
              <div className="mb-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Account created successfully! Redirecting to your dashboard...
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 shadow-sm">
                {error}
              </div>
            )}

            <RegisterForm
              form={form}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
            />

            <p className="mt-8 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-orange-600 hover:text-orange-700 hover:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
