import React from "react";

export default function RegisterForm({ form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          First Name
        </label>
        <input
          type="text"
          name="firstname"
          value={form.firstname}
          onChange={onChange}
          placeholder="Juan"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Last Name
        </label>
        <input
          type="text"
          name="lastname"
          value={form.lastname}
          onChange={onChange}
          placeholder="Dela Cruz"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Email Address
        </label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="juan@email.com"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">
          Password
        </label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="At least 8 characters"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 active:from-orange-700 active:to-orange-800 text-white font-semibold py-3 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? "Creating account..." : "Create Account"}
      </button>
    </form>
  );
}
