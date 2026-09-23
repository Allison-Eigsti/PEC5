import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AuthPageLayout, { AuthLink } from '../components/AuthPageLayout';
import ErrorMessage from '../components/ErrorMessage';
import FormField, { inputClass } from '../components/FormField';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/my-listings" replace />;
  }

  function updateValue(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(form);
      const destination = location.state?.from?.pathname || '/my-listings';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Welcome back"
      title="Your closet has a new address."
      description="Sign in to manage your listings, update prices, and keep an eye on the pieces you have passed along."
      footer={<>New to Reworn? <AuthLink to="/register">Create an account</AuthLink></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email address" id="email">
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateValue} className={inputClass} placeholder="you@example.com" required />
        </FormField>
        <FormField label="Password" id="password">
          <input id="password" name="password" type="password" autoComplete="current-password" value={form.password} onChange={updateValue} className={inputClass} placeholder="Your password" required />
        </FormField>
        <ErrorMessage>{error}</ErrorMessage>
        <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-emerald-800 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-xs leading-5 text-stone-400">Your session is stored in a secure, HTTP-only cookie.</p>
    </AuthPageLayout>
  );
}
