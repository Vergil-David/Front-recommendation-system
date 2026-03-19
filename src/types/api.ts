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
