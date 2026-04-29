import { useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BadgeCheck,
  Camera,
  Globe,
  LockKeyhole,
  Mail,
  Shield,
  SlidersHorizontal,
  Sparkles,
  UserRound,
} from "lucide-react";
import { me } from "@/api/auth";
import { useAuthStore } from "@/features/auth/authStore";
import { cn } from "@/utils/cn";
import type { User } from "@/types/api";

type ContentFocus = "Movies" | "Books" | "Both";
type RecommendationMood = "Balanced" | "Popular" | "Niche";
type LanguagePreference = "Ukrainian" | "English" | "Mixed";

type LocalPreferences = {
  contentFocus: ContentFocus;
  recommendationMood: RecommendationMood;
  languagePreference: LanguagePreference;
};

const SETTINGS_PREFERENCES_KEY = "settings-preferences";
const contentFocusOptions = ["Movies", "Books", "Both"] as const;
const recommendationMoodOptions = ["Balanced", "Popular", "Niche"] as const;
const languagePreferenceOptions = ["Ukrainian", "English", "Mixed"] as const;

const defaultPreferences: LocalPreferences = {
  contentFocus: "Movies",
  recommendationMood: "Balanced",
  languagePreference: "Ukrainian",
};

const profileEditingAvailable = false;

const formatDateTime = (value?: string) => {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getDisplayName = (user: User) => user.display_name?.trim() || user.username;

const getInitials = (user: User) => {
  const source = getDisplayName(user).trim();
  if (!source) {
    return "U";
  }

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const getStatusTone = (value?: boolean) =>
  value
    ? "bg-[#eef4ed] text-[#0b2545]"
    : "bg-[#0b2545]/70 text-[#8da9c4]";

const loadPreferences = (): LocalPreferences => {
  if (typeof window === "undefined") {
    return defaultPreferences;
  }

  const raw = window.localStorage.getItem(SETTINGS_PREFERENCES_KEY);
  if (!raw) {
    return defaultPreferences;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LocalPreferences>;

    return {
      contentFocus:
        parsed.contentFocus === "Movies" ||
        parsed.contentFocus === "Books" ||
        parsed.contentFocus === "Both"
          ? parsed.contentFocus
          : defaultPreferences.contentFocus,
      recommendationMood:
        parsed.recommendationMood === "Balanced" ||
        parsed.recommendationMood === "Popular" ||
        parsed.recommendationMood === "Niche"
          ? parsed.recommendationMood
          : defaultPreferences.recommendationMood,
      languagePreference:
        parsed.languagePreference === "Ukrainian" ||
        parsed.languagePreference === "English" ||
        parsed.languagePreference === "Mixed"
          ? parsed.languagePreference
          : defaultPreferences.languagePreference,
    };
  } catch {
    return defaultPreferences;
  }
};

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-[#8da9c4]">
        <span className="rounded-full bg-[#0b2545]/55 p-2 text-[#eef4ed]">{icon}</span>
        <p className="text-xs font-semibold uppercase tracking-[0.24em]">{eyebrow}</p>
      </div>
      <h2 className="text-2xl font-semibold text-[#eef4ed]">{title}</h2>
      <p className="max-w-2xl text-sm leading-6 text-[#8da9c4]">{description}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[#0b2545]/45 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8da9c4]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#eef4ed]">{value}</p>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
  placeholder,
  multiline = false,
}: {
  label: string;
  value?: string;
  placeholder: string;
  multiline?: boolean;
}) {
  const sharedClassName =
    "w-full rounded-2xl bg-[#0b2545]/60 px-4 py-3 text-sm text-[#eef4ed] outline-none placeholder:text-[#8da9c4]/70 disabled:cursor-not-allowed disabled:opacity-100";

  return (
    <label className="space-y-2">
      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8da9c4]">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value ?? ""}
          placeholder={placeholder}
          disabled
          rows={4}
          className={sharedClassName}
        />
      ) : (
        <input value={value ?? ""} placeholder={placeholder} disabled className={sharedClassName} />
      )}
    </label>
  );
}

function PreferenceSelector<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl bg-[#0b2545]/45 p-4">
      <p className="text-sm font-semibold text-[#eef4ed]">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition duration-300",
              value === option
                ? "bg-[#eef4ed] text-[#0b2545]"
                : "bg-[#13315c] text-[#8da9c4] hover:bg-[#134074] hover:text-[#eef4ed]",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SettingsPage() {
  const token = useAuthStore((state) => state.token);
  const storedUser = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [preferences, setPreferences] = useState<LocalPreferences>(loadPreferences);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: me,
    enabled: Boolean(token),
    retry: false,
    initialData: storedUser ? { user: storedUser } : undefined,
  });

  useEffect(() => {
    if (meQuery.data?.user) {
      setUser(meQuery.data.user);
    }
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_PREFERENCES_KEY, JSON.stringify(preferences));
    }
  }, [preferences]);

  const user = meQuery.data?.user ?? storedUser;
  const loading = meQuery.isLoading && !user;
  const error = meQuery.isError ? "Не вдалося завантажити профіль користувача." : null;

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8da9c4]">
              Settings
            </p>
            <h1 className="font-display text-4xl font-bold text-[#eef4ed] md:text-5xl">
              Tune your PageStream profile
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[#8da9c4]">
              Keep your identity, account details, and discovery preferences in one calm place.
            </p>
          </div>
          <div className="glass w-fit rounded-full px-4 py-2 text-sm font-semibold text-[#eef4ed]">
            {profileEditingAvailable ? "Profile editing enabled" : "Profile editing coming soon"}
          </div>
        </div>

        {loading && (
          <p className="glass w-fit rounded-full px-5 py-3 text-base font-medium text-[#eef4ed]">
            Завантаження профілю...
          </p>
        )}

        {error && !user && (
          <article className="rounded-3xl bg-[#13315c] p-6">
            <p className="text-lg font-semibold text-[#eef4ed]">Profile unavailable</p>
            <p className="mt-2 text-sm leading-6 text-[#8da9c4]">{error}</p>
          </article>
        )}

        {!loading && !error && !user && (
          <article className="rounded-3xl bg-[#13315c] p-6">
            <p className="text-lg font-semibold text-[#eef4ed]">No profile data</p>
            <p className="mt-2 text-sm leading-6 text-[#8da9c4]">
              Reload the page or sign in again to restore your account details.
            </p>
          </article>
        )}

        {user && (
          <>
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <article className="rounded-3xl bg-[#13315c] p-6 md:p-7">
                <SectionHeader
                  icon={<UserRound className="h-4 w-4" aria-hidden="true" />}
                  eyebrow="Profile"
                  title="Your public identity"
                  description="A clear overview of how your profile currently appears inside PageStream."
                />

                <div className="mt-6 grid gap-6 lg:grid-cols-[auto_1fr]">
                  <div className="flex flex-col items-center gap-4 rounded-[28px] bg-[#0b2545]/45 p-6 text-center">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={getDisplayName(user)}
                        className="h-28 w-28 rounded-full object-cover shadow-[0_18px_45px_rgba(0,0,0,0.35)]"
                      />
                    ) : (
                      <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#eef4ed] text-3xl font-bold text-[#0b2545] shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
                        {getInitials(user)}
                      </div>
                    )}
                    <div className="space-y-2">
                      <p className="text-xl font-semibold text-[#eef4ed]">{getDisplayName(user)}</p>
                      <p className="text-sm text-[#8da9c4]">@{user.username}</p>
                      {user.role && (
                        <span className="inline-flex rounded-full bg-[#0b2545]/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#8da9c4]">
                          {user.role}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoRow label="Display name" value={user.display_name || "Not set yet"} />
                    <InfoRow label="Username" value={`@${user.username}`} />
                    <InfoRow label="Email" value={user.email} />
                    <InfoRow label="Bio" value={user.bio || "No bio added yet."} />
                  </div>
                </div>
              </article>

              <article className="rounded-3xl bg-[#13315c] p-6 md:p-7">
                <SectionHeader
                  icon={<Sparkles className="h-4 w-4" aria-hidden="true" />}
                  eyebrow="Editing"
                  title="Profile editing"
                  description="Display name, avatar URL, and bio will become editable here once the backend exposes a profile update endpoint."
                />

                <div className="mt-6 space-y-4">
                  <ReadOnlyField
                    label="Display name"
                    value={user.display_name}
                    placeholder="Display name coming soon"
                  />
                  <ReadOnlyField
                    label="Avatar URL"
                    value={user.avatar_url}
                    placeholder="Avatar URL editing coming soon"
                  />
                  <ReadOnlyField
                    label="Bio"
                    value={user.bio}
                    placeholder="Bio editing coming soon"
                    multiline
                  />
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-[#8da9c4]">
                    No profile update API is available in the current project, so these fields stay
                    read-only for now.
                  </p>
                  <button
                    type="button"
                    disabled
                    className="rounded-xl bg-[#eef4ed]/70 px-5 py-3 text-sm font-semibold text-[#0b2545] opacity-70"
                  >
                    Save Changes
                  </button>
                </div>
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <article className="rounded-3xl bg-[#13315c] p-6 md:p-7">
                <SectionHeader
                  icon={<BadgeCheck className="h-4 w-4" aria-hidden="true" />}
                  eyebrow="Account"
                  title="Account details"
                  description="Verification, activity, and account timestamps from your current backend profile."
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Username" value={user.username} />
                  <div className="rounded-2xl bg-[#0b2545]/45 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8da9c4]">
                      Email verification
                    </p>
                    <span
                      className={cn(
                        "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        getStatusTone(user.email_verified),
                      )}
                    >
                      {user.email_verified ? "Verified" : "Not verified"}
                    </span>
                  </div>
                  <div className="rounded-2xl bg-[#0b2545]/45 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8da9c4]">
                      Account status
                    </p>
                    <span
                      className={cn(
                        "mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
                        getStatusTone(user.is_active),
                      )}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <InfoRow label="Created at" value={formatDateTime(user.created_at)} />
                  <InfoRow label="Last login" value={formatDateTime(user.last_login_at)} />
                </div>
              </article>

              <article className="rounded-3xl bg-[#13315c] p-6 md:p-7">
                <SectionHeader
                  icon={<SlidersHorizontal className="h-4 w-4" aria-hidden="true" />}
                  eyebrow="Preferences"
                  title="Discovery preferences"
                  description="These controls are frontend-only for now and are stored locally in your browser."
                />

                <div className="mt-6 space-y-4">
                  <PreferenceSelector
                    label="Content focus"
                    value={preferences.contentFocus}
                    options={contentFocusOptions}
                    onChange={(contentFocus) =>
                      setPreferences((current) => ({ ...current, contentFocus }))
                    }
                  />
                  <PreferenceSelector
                    label="Recommendation mood"
                    value={preferences.recommendationMood}
                    options={recommendationMoodOptions}
                    onChange={(recommendationMood) =>
                      setPreferences((current) => ({ ...current, recommendationMood }))
                    }
                  />
                  <PreferenceSelector
                    label="Language preference"
                    value={preferences.languagePreference}
                    options={languagePreferenceOptions}
                    onChange={(languagePreference) =>
                      setPreferences((current) => ({ ...current, languagePreference }))
                    }
                  />
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#8da9c4]">
                  <span className="rounded-full bg-[#0b2545]/55 px-3 py-1">
                    Stored in local browser storage
                  </span>
                  <span className="rounded-full bg-[#0b2545]/55 px-3 py-1">
                    No backend sync yet
                  </span>
                </div>
              </article>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <article className="rounded-3xl bg-[#13315c] p-6 md:p-7">
                <SectionHeader
                  icon={<Shield className="h-4 w-4" aria-hidden="true" />}
                  eyebrow="Security"
                  title="Keep your account protected"
                  description="Security controls are acknowledged here, but the related backend flows are not available yet."
                />

                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl bg-[#0b2545]/45 p-4">
                    <div className="flex items-start gap-3">
                      <span className="rounded-full bg-[#13315c] p-2 text-[#eef4ed]">
                        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#eef4ed]">Password update</p>
                        <p className="mt-2 text-sm leading-6 text-[#8da9c4]">
                          Coming soon. No change-password API is present in the current backend.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#0b2545]/45 p-4">
                    <div className="flex items-start gap-3">
                      <span className="rounded-full bg-[#13315c] p-2 text-[#eef4ed]">
                        <Shield className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#eef4ed]">Active sessions</p>
                        <p className="mt-2 text-sm leading-6 text-[#8da9c4]">
                          Coming soon. Session management endpoints are not available yet.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <article className="rounded-3xl bg-[#13315c] p-6 md:p-7">
                <SectionHeader
                  icon={<Globe className="h-4 w-4" aria-hidden="true" />}
                  eyebrow="Snapshot"
                  title="Quick account snapshot"
                  description="A compact summary of the current profile payload returned by `GET /users/me`."
                />

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoRow label="Role" value={user.role || "Not provided"} />
                  <InfoRow label="Avatar URL" value={user.avatar_url || "Not provided"} />
                  <InfoRow label="Bio length" value={`${user.bio?.trim().length ?? 0} characters`} />
                  <InfoRow
                    label="Contact"
                    value={user.email ? `${user.username} • ${user.email}` : user.username}
                  />
                </div>

                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[#0b2545]/45 p-4">
                  <span className="rounded-full bg-[#13315c] p-2 text-[#eef4ed]">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-6 text-[#8da9c4]">
                    Settings uses only the existing authenticated profile endpoint and local browser
                    storage. No extra hidden network calls are made from this page.
                  </p>
                </div>

                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-[#0b2545]/45 p-4">
                  <span className="rounded-full bg-[#13315c] p-2 text-[#eef4ed]">
                    <Camera className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm leading-6 text-[#8da9c4]">
                    Avatar preview is live when `avatar_url` exists in your current profile data;
                    otherwise the page falls back to your initials.
                  </p>
                </div>
              </article>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
