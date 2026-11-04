export type User = {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role?: string;
  is_active?: boolean;
  email_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
};

export type ApiErrorResponse = {
  error: string;
};

export type PingResponse = {
  message: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type MeResponse = {
  user: User;
};

export type FriendsResponse = {
  friends: User[];
};

export type RelationStatus = "none" | "pending_sent" | "pending_received" | "friends";

export type UserSearchResult = {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
  relation_status: RelationStatus;
};

export type SearchUsersResponse = {
  users: UserSearchResult[];
};

export type FriendRequestUser = {
  id: string;
  email?: string;
  username: string;
  display_name?: string;
  avatar_url?: string;
};

export type IncomingFriendRequest = {
  from_user: FriendRequestUser;
  status: "pending";
  created_at: string;
};

export type OutgoingFriendRequest = {
  to_user: FriendRequestUser;
  status: "pending";
  created_at: string;
};

export type IncomingFriendRequestsResponse = {
  requests: IncomingFriendRequest[];
};

export type OutgoingFriendRequestsResponse = {
  requests: OutgoingFriendRequest[];
};

export type SendFriendRequest = {
  to_user_id: string;
};

export type SendFriendRequestResponse = {
  status: "pending";
};

export type RespondFriendRequest = {
  from_user_id: string;
  action: "accept" | "reject";
};

export type RespondFriendRequestResponse = {
  status: "accepted" | "rejected" | "pending";
};
