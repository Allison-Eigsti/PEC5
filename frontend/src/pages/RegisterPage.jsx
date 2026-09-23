import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import AuthPageLayout, { AuthLink } from '../components/AuthPageLayout';
import ErrorMessage from '../components/ErrorMessage';
import FormField, { inputClass } from '../components/FormField';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
      await register(form);
      navigate('/sell', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Join the community"
      title="Give your clothes another life."
      description="Create a free account to list pieces, tell their story, and find thoughtful pre-owned style from other people."
      footer={<>Already have an account? <AuthLink to="/login">Sign in</AuthLink></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Your name" id="name">
          <input id="name" name="name" autoComplete="name" value={form.name} onChange={updateValue} className={inputClass} placeholder="Alex Morgan" minLength={2} maxLength={80} required />
        </FormField>
        <FormField label="Email address" id="email">
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={updateValue} className={inputClass} placeholder="you@example.com" required />
        </FormField>
        <FormField label="Password" id="password" hint="Use 8–72 characters.">
          <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={updateValue} className={inputClass} placeholder="Create a secure password" minLength={8} maxLength={72} required />
        </FormField>
        <ErrorMessage>{error}</ErrorMessage>
        <button type="submit" disabled={submitting} className="w-full rounded-2xl bg-emerald-800 px-5 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="mt-6 text-center text-xs leading-5 text-stone-400">By joining, you agree to be kind and describe your items honestly.</p>
    </AuthPageLayout>
  );
}
