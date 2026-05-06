import React from 'react';

export default function LoginForm({ form, onChange, onSubmit, loading }) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Email Address</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={onChange}
          placeholder="juan@email.com"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          placeholder="Enter your password"
          required
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-gray-900 hover:bg-gray-700 active:bg-gray-800 text-white font-semibold py-3 text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
