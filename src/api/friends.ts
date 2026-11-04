import { apiClient } from "@/api/client";
import type {
  FriendsResponse,
  IncomingFriendRequestsResponse,
  OutgoingFriendRequestsResponse,
  RespondFriendRequest,
  RespondFriendRequestResponse,
  SendFriendRequestResponse,
  SearchUsersResponse,
} from "@/types/api";

export const searchUsers = async (query: string, limit = 20) => {
  const response = await apiClient.get<SearchUsersResponse>("/users/search", {
    params: { q: query, limit },
  });

  return response.data;
};

export const getFriends = async () => {
  const response = await apiClient.get<FriendsResponse>("/friends");
  return response.data;
};

export const sendFriendRequest = async (userId: string) => {
  const response = await apiClient.post<SendFriendRequestResponse>("/friends/requests", {
    to_user_id: userId,
  });

  return response.data;
};

export const getIncomingFriendRequests = async () => {
  const response = await apiClient.get<IncomingFriendRequestsResponse>(
    "/friends/requests/incoming",
  );

  return response.data;
};

export const getOutgoingFriendRequests = async () => {
  const response = await apiClient.get<OutgoingFriendRequestsResponse>(
    "/friends/requests/outgoing",
  );

  return response.data;
};

export const respondToFriendRequest = async (
  fromUserId: string,
  action: RespondFriendRequest["action"],
) => {
  const response = await apiClient.post<RespondFriendRequestResponse>("/friends/requests/respond", {
    from_user_id: fromUserId,
    action,
  });

  return response.data;
};

export const respondFriendRequest = async (payload: RespondFriendRequest) =>
  respondToFriendRequest(payload.from_user_id, payload.action);
