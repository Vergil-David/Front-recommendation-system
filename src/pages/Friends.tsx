import { type FormEvent, useCallback, useEffect, useState } from "react";
import {
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  respondToFriendRequest,
  searchUsers,
  sendFriendRequest,
} from "@/api/friends";
import { getMovies, type Movie } from "@/api/movies";
import { RowSection } from "@/components/RowSection";
import type {
  FriendRequestUser,
  IncomingFriendRequest,
  OutgoingFriendRequest,
  User,
  UserSearchResult,
} from "@/types/api";

type RequestAction = "accept" | "reject";

type DisplayUser = {
  id: string;
  email?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
};

const getDisplayName = (user: DisplayUser) => user.display_name || user.username;

const getInitial = (user: DisplayUser) =>
  getDisplayName(user).trim().charAt(0).toUpperCase() || "U";

const formatRequestDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
};

function UserAvatar({ user }: { user: DisplayUser }) {
  if (user.avatar_url) {
    return (
      <img
        alt={getDisplayName(user)}
        className="h-11 w-11 rounded-full object-cover"
        src={user.avatar_url}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ed] text-sm font-bold text-[#0b2545]">
      {getInitial(user)}
    </div>
  );
}

function UserSummary({ user, meta }: { user: DisplayUser; meta?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <UserAvatar user={user} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-[#eef4ed]">{getDisplayName(user)}</p>
        <p className="mt-1 truncate text-xs text-[#8da9c4]">
          {meta || user.email || `@${user.username}`}
        </p>
      </div>
    </div>
  );
}

export function Friends() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [moviesLoading, setMoviesLoading] = useState(true);
  const [moviesError, setMoviesError] = useState<string | null>(null);

  const [friends, setFriends] = useState<User[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState<string | null>(null);

  const [incomingRequests, setIncomingRequests] = useState<IncomingFriendRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<OutgoingFriendRequest[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadFriends = useCallback(async () => {
    try {
      setFriendsLoading(true);
      setFriendsError(null);
      const data = await getFriends();
      setFriends(data.friends ?? []);
    } catch {
      setFriendsError("Не вдалося завантажити список друзів");
    } finally {
      setFriendsLoading(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      setRequestsLoading(true);
      setRequestsError(null);
      const [incomingData, outgoingData] = await Promise.all([
        getIncomingFriendRequests(),
        getOutgoingFriendRequests(),
      ]);

      setIncomingRequests(incomingData.requests ?? []);
      setOutgoingRequests(outgoingData.requests ?? []);
    } catch {
      setRequestsError("Не вдалося завантажити заявки у друзі");
    } finally {
      setRequestsLoading(false);
    }
  }, []);

  const runSearch = useCallback(async (query: string) => {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      setActiveSearchQuery("");
      setSearchResults([]);
      setSearchError("Введіть username, email або display name.");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      setActiveSearchQuery(normalizedQuery);
      const data = await searchUsers(normalizedQuery, 20);
      setSearchResults(data.users ?? []);
    } catch {
      setSearchError("Не вдалося виконати пошук користувачів");
    } finally {
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFriends();
    void loadRequests();
  }, [loadFriends, loadRequests]);

  useEffect(() => {
    let isMounted = true;

    const loadMovies = async () => {
      try {
        setMoviesLoading(true);
        setMoviesError(null);
        const data = await getMovies();

        if (isMounted) {
          setMovies(data.items);
        }
      } catch {
        if (isMounted) {
          setMoviesError("Не вдалося завантажити фільми");
        }
      } finally {
        if (isMounted) {
          setMoviesLoading(false);
        }
      }
    };

    void loadMovies();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshAfterAction = async () => {
    await Promise.all([
      loadFriends(),
      loadRequests(),
      activeSearchQuery ? runSearch(activeSearchQuery) : Promise.resolve(),
    ]);
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(searchQuery);
  };

  const onAddFriend = async (userId: string) => {
    const actionKey = `add:${userId}`;

    try {
      setActionLoading(actionKey);
      setActionError(null);
      await sendFriendRequest(userId);
      await Promise.all([
        loadRequests(),
        activeSearchQuery ? runSearch(activeSearchQuery) : Promise.resolve(),
      ]);
    } catch {
      setActionError("Не вдалося надіслати заявку у друзі");
    } finally {
      setActionLoading(null);
    }
  };

  const onRespondToRequest = async (fromUserId: string, action: RequestAction) => {
    const actionKey = `${action}:${fromUserId}`;

    try {
      setActionLoading(actionKey);
      setActionError(null);
      await respondToFriendRequest(fromUserId, action);
      await refreshAfterAction();
    } catch {
      setActionError("Не вдалося оновити заявку у друзі");
    } finally {
      setActionLoading(null);
    }
  };

  const renderRequestActions = (user: FriendRequestUser) => {
    const acceptKey = `accept:${user.id}`;
    const rejectKey = `reject:${user.id}`;
    const isBusy = actionLoading === acceptKey || actionLoading === rejectKey;

    return (
      <div className="flex shrink-0 flex-wrap gap-2">
        <button
          type="button"
          className="rounded-xl bg-[#eef4ed] px-4 py-2 text-xs font-semibold text-[#0b2545] transition hover:bg-[#eef4ed]/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(actionLoading)}
          onClick={() => onRespondToRequest(user.id, "accept")}
        >
          {actionLoading === acceptKey ? "Accepting..." : "Accept"}
        </button>
        <button
          type="button"
          className="rounded-xl bg-[#0b2545]/70 px-4 py-2 text-xs font-semibold text-[#eef4ed] transition hover:bg-[#0b2545] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={Boolean(actionLoading)}
          onClick={() => onRespondToRequest(user.id, "reject")}
        >
          {actionLoading === rejectKey ? "Rejecting..." : "Reject"}
        </button>
        {isBusy && <span className="sr-only">Updating request</span>}
      </div>
    );
  };

  const renderSearchActions = (user: UserSearchResult) => {
    if (user.relation_status === "friends") {
      return (
        <span className="w-fit rounded-full bg-[#eef4ed] px-3 py-1 text-xs font-semibold text-[#0b2545]">
          Friends
        </span>
      );
    }

    if (user.relation_status === "pending_sent") {
      return (
        <span className="w-fit rounded-full bg-[#0b2545]/70 px-3 py-1 text-xs font-semibold text-[#8da9c4]">
          Request Sent
        </span>
      );
    }

    if (user.relation_status === "pending_received") {
      return renderRequestActions(user);
    }

    const actionKey = `add:${user.id}`;

    return (
      <button
        type="button"
        className="rounded-xl bg-[#134074] px-4 py-2 text-xs font-semibold text-[#eef4ed] transition hover:bg-[#134074]/90 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={Boolean(actionLoading)}
        onClick={() => onAddFriend(user.id)}
      >
        {actionLoading === actionKey ? "Sending..." : "Add Friend"}
      </button>
    );
  };

  return (
    <section className="min-h-screen px-4 pb-20 pt-24 md:px-8">
      <div className="mx-auto max-w-[1440px] space-y-10">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#8da9c4]">Friends</p>
          <h1 className="font-display text-4xl font-bold text-[#eef4ed] md:text-5xl">
            See what your circle is watching
          </h1>
          <p className="max-w-2xl text-base leading-7 text-[#8da9c4]">
            Social discovery stays lightweight here: your real friends paired with recommendations
            from the current movie feed.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl bg-[#13315c] p-5">
            <div className="space-y-2">
              <p className="text-lg font-semibold text-[#eef4ed]">Search users</p>
              <p className="text-sm text-[#8da9c4]">Search by username, email, or display name.</p>
            </div>

            <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={onSearch}>
              <input
                className="min-h-11 flex-1 rounded-xl bg-[#0b2545]/70 px-4 text-sm text-[#eef4ed] outline-none transition placeholder:text-[#8da9c4] focus:bg-[#0b2545]"
                placeholder="Username, email, or display name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button
                type="submit"
                className="rounded-xl bg-[#134074] px-5 py-3 text-sm font-semibold text-[#eef4ed] transition hover:bg-[#134074]/90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={searchLoading}
              >
                {searchLoading ? "Searching..." : "Search"}
              </button>
            </form>

            <div className="mt-5 space-y-3">
              {searchError && <p className="text-sm text-[#8da9c4]">{searchError}</p>}
              {actionError && <p className="text-sm text-[#8da9c4]">{actionError}</p>}
              {searchLoading && <p className="text-sm text-[#eef4ed]">Завантаження...</p>}

              {!searchLoading &&
                !searchError &&
                activeSearchQuery &&
                searchResults.map((user) => (
                  <div key={user.id} className="rounded-xl bg-[#0b2545]/45 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <UserSummary user={user} meta={user.email} />
                      {renderSearchActions(user)}
                    </div>
                  </div>
                ))}

              {!searchLoading &&
                !searchError &&
                activeSearchQuery &&
                searchResults.length === 0 && (
                  <p className="text-sm leading-6 text-[#8da9c4]">
                    No users found for this search.
                  </p>
                )}
            </div>
          </article>

          <div className="space-y-4">
            <article className="rounded-2xl bg-[#13315c] p-5">
              <p className="text-lg font-semibold text-[#eef4ed]">Incoming requests</p>
              <p className="mt-2 text-sm text-[#8da9c4]">People waiting for your response.</p>

              <div className="mt-5 space-y-3">
                {requestsLoading && <p className="text-sm text-[#eef4ed]">Завантаження...</p>}
                {requestsError && <p className="text-sm text-[#8da9c4]">{requestsError}</p>}

                {!requestsLoading && !requestsError && incomingRequests.length === 0 && (
                  <p className="text-sm leading-6 text-[#8da9c4]">No pending incoming requests.</p>
                )}

                {!requestsLoading &&
                  !requestsError &&
                  incomingRequests.map((request) => (
                    <div key={request.from_user.id} className="rounded-xl bg-[#0b2545]/45 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <UserSummary
                          user={request.from_user}
                          meta={formatRequestDate(request.created_at) || "Pending"}
                        />
                        {renderRequestActions(request.from_user)}
                      </div>
                    </div>
                  ))}
              </div>
            </article>

            <article className="rounded-2xl bg-[#13315c] p-5">
              <p className="text-lg font-semibold text-[#eef4ed]">Outgoing requests</p>
              <p className="mt-2 text-sm text-[#8da9c4]">Requests you have already sent.</p>

              <div className="mt-5 space-y-3">
                {requestsLoading && <p className="text-sm text-[#eef4ed]">Завантаження...</p>}
                {requestsError && <p className="text-sm text-[#8da9c4]">{requestsError}</p>}

                {!requestsLoading && !requestsError && outgoingRequests.length === 0 && (
                  <p className="text-sm leading-6 text-[#8da9c4]">No outgoing requests yet.</p>
                )}

                {!requestsLoading &&
                  !requestsError &&
                  outgoingRequests.map((request) => (
                    <div key={request.to_user.id} className="rounded-xl bg-[#0b2545]/45 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <UserSummary
                          user={request.to_user}
                          meta={formatRequestDate(request.created_at) || "Pending"}
                        />
                        <span className="w-fit rounded-full bg-[#0b2545]/70 px-3 py-1 text-xs font-semibold text-[#8da9c4]">
                          Request Sent
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </article>
          </div>
        </div>

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-[#eef4ed]">My Circle</p>
            <p className="text-sm text-[#8da9c4]">People connected to your PageStream account.</p>
          </div>

          {friendsLoading && <p className="text-base text-[#eef4ed]">Завантаження...</p>}
          {friendsError && <p className="text-base text-[#eef4ed]">{friendsError}</p>}

          {!friendsLoading && !friendsError && friends.length === 0 && (
            <article className="rounded-2xl bg-[#13315c] p-5">
              <p className="text-lg font-semibold text-[#eef4ed]">No friends yet</p>
              <p className="mt-2 text-sm text-[#8da9c4]">
                Search for people above and send your first friend request.
              </p>
            </article>
          )}

          {!friendsLoading && !friendsError && friends.length > 0 && (
            <div className="grid gap-4 md:grid-cols-3">
              {friends.map((friend) => (
                <article
                  key={friend.id}
                  className="rounded-2xl bg-[#13315c] p-5 transition duration-300 hover:scale-[1.02]"
                >
                  <UserSummary user={friend} meta={friend.email} />
                </article>
              ))}
            </div>
          )}
        </section>

        {moviesLoading && <p className="text-base text-[#eef4ed]">Завантаження...</p>}
        {moviesError && <p className="text-base text-[#eef4ed]">{moviesError}</p>}

        {!moviesLoading && !moviesError && (
          <RowSection title="Recommendations From Friends" movies={movies.slice(0, 10)} />
        )}
      </div>
    </section>
  );
}
