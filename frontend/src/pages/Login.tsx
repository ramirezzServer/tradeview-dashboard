import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError, getHumanApiError } from '@/services/api';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { PageMeta } from '@/components/public/PageMeta';
import { PublicFooter } from '@/components/public/PublicFooter';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');
    setFieldErrors({});
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.errors ?? {});
      }
      setError(getHumanApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (field: string) => fieldErrors[field]?.[0];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <PageMeta
        title="Sign in | TradeView Dashboard"
        description="Sign in to TradeView Dashboard to manage watchlists, portfolio tracking, market news, and dashboard settings."
      />
      <div className="w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/15 shadow-[0_0_20px_-4px_hsl(var(--primary)/0.2)]">
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
          </div>
          <span className="text-[17px] font-bold tracking-tight text-foreground">TradeView</span>
        </div>

        {/* Card */}
        <main className="glass-card rounded-2xl p-7" aria-labelledby="login-title">
          <div className="mb-6">
            <h1 id="login-title" className="text-[18px] font-bold text-foreground">Welcome back</h1>
            <p className="text-[10px] text-muted-foreground/40 mt-1 tracking-wide">Sign in to your trading dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">
                Email
              </label>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                autoComplete="email"
                aria-invalid={!!fieldError('email')}
                aria-describedby={fieldError('email') ? 'login-email-error' : undefined}
                className="h-9 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25"
              />
              {fieldError('email') && <p id="login-email-error" className="text-[10px] text-bear mt-1">{fieldError('email')}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="text-[10px] font-semibold text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  aria-invalid={!!fieldError('password')}
                  aria-describedby={fieldError('password') ? 'login-password-error' : undefined}
                  className="h-9 bg-secondary/30 border-border/20 text-sm placeholder:text-muted-foreground/25 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
              {fieldError('password') && <p id="login-password-error" className="text-[10px] text-bear mt-1">{fieldError('password')}</p>}
            </div>

            {error && (
              <p role="alert" className="text-[11px] text-bear font-medium px-1">{error}</p>
            )}

            <LoadingButton
              type="submit"
              loading={isLoading}
              loadingLabel="Signing in..."
              className="w-full h-9 rounded-lg bg-primary/90 hover:bg-primary text-primary-foreground text-[12px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_16px_-4px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_24px_-4px_hsl(var(--primary)/0.5)] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {!isLoading && <LogIn className="h-3.5 w-3.5" />}
              Sign in
            </LoadingButton>
          </form>

          <p className="text-center text-[10px] text-muted-foreground/35 mt-5">
            No account yet?{' '}
            <Link to="/register" className="text-primary/70 hover:text-primary transition-colors font-semibold">
              Create one
            </Link>
          </p>
        </main>
        <PublicFooter />
      </div>
    </div>
  );
};

export default Login;
