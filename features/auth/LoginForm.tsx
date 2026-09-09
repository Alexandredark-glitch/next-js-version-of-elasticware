"use client";

import {
  useActionState,
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { useGlobalError } from "@/hooks/useGlobalError";
import { loginAction, type LoginState } from "@/app/login/actions";

const initialState: LoginState = {};

export function LoginForm({
  redirectTo,
}: {
  redirectTo: string;
}) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  const { setError } = useGlobalError();

  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  useEffect(() => {
    if (state?.error) {
      setError(state.error);
    }
  }, [state?.error, setError]);

  function validate() {
    const e: typeof errors = {};

    if (!email.trim()) {
      e.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Enter a valid email";
    }

    if (!password) {
      e.password = "Password is required";
    } else if (password.length < 8) {
      e.password = "Must be at least 8 characters";
    }

    setErrors(e);

    return !e.email && !e.password;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submitter = (event.nativeEvent as SubmitEvent)
      .submitter as HTMLButtonElement | null;

    const intent = submitter?.getAttribute("value");

    if (intent === "demo") {
      return;
    }

    if (!validate()) {
      event.preventDefault();
    }
  }

  const inputBase =
    "w-full rounded-xl border bg-charcoal-800 px-4 py-3 text-sm text-cream-100 placeholder:text-charcoal-400 transition-colors focus:outline-none focus:ring-2";

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="rounded-2xl bg-charcoal-800 border border-charcoal-700 overflow-hidden">
        <div className="p-7">
          <h1 className="font-heading text-2xl font-bold text-cream-100 mb-1">
            Welcome back
          </h1>

          <p className="text-sm text-charcoal-400 mb-6">
            Sign in to your agent dashboard
          </p>

          <form
            action={formAction}
            onSubmit={handleSubmit}
            noValidate
            className="space-y-4"
          >
            <input type="hidden" name="redirectTo" value={redirectTo} />

            <div>
              <label
                htmlFor={emailId}
                className="mb-1.5 block text-sm font-medium text-charcoal-200"
              >
                Email
              </label>

              <input
                id={emailId}
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={
                  errors.email ? `${emailId}-err` : undefined
                }
                className={cn(
                  inputBase,
                  errors.email
                    ? "border-accent-500/60 focus:ring-accent-500/40"
                    : "border-charcoal-600 focus:border-teal-500/60 focus:ring-teal-500/30"
                )}
                placeholder="you@example.com"
              />

              {errors.email && (
                <p
                  id={`${emailId}-err`}
                  role="alert"
                  className="mt-1.5 text-xs text-accent-400"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor={passwordId}
                className="mb-1.5 block text-sm font-medium text-charcoal-200"
              >
                Password
              </label>

              <input
                id={passwordId}
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? `${passwordId}-err` : undefined
                }
                className={cn(
                  inputBase,
                  errors.password
                    ? "border-accent-500/60 focus:ring-accent-500/40"
                    : "border-charcoal-600 focus:border-teal-500/60 focus:ring-teal-500/30"
                )}
                placeholder="Enter your password"
              />

              {errors.password && (
                <p
                  id={`${passwordId}-err`}
                  role="alert"
                  className="mt-1.5 text-xs text-accent-400"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              name="intent"
              value="login"
              disabled={isPending}
              className={cn(
                "w-full rounded-xl py-3 text-sm font-semibold text-white transition-all focus-ring",
                "bg-accent-500 hover:bg-accent-600 active:scale-[0.99]",
                isPending && "opacity-60 cursor-not-allowed"
              )}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </button>

            <button
              type="submit"
              name="intent"
              value="demo"
              disabled={isPending}
              className="w-full rounded-xl py-3 text-sm font-semibold text-cream-100 transition-all focus-ring border border-charcoal-600 hover:bg-charcoal-700 active:scale-[0.99] disabled:opacity-60"
            >
              Try Live Demo →
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-charcoal-400">
            No account?{" "}
            <Link
              href="/signup"
              className="font-semibold text-teal-400 hover:text-teal-300 focus-ring rounded"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}