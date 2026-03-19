import { apiClient } from "@/api/client";
import type {
  FriendsResponse,
  RespondFriendRequest,
  RespondFriendRequestResponse,
  SendFriendRequest,
  SendFriendRequestResponse,
} from "@/types/api";

export const getFriends = async () => {
  const response = await apiClient.get<FriendsResponse>("/friends");
  return response.data;
};

export const sendFriendRequest = async (payload: SendFriendRequest) => {
  const response = await apiClient.post<SendFriendRequestResponse>("/friends/requests", payload);
  return response.data;
};

export const respondFriendRequest = async (payload: RespondFriendRequest) => {
  const response = await apiClient.post<RespondFriendRequestResponse>(
    "/friends/requests/respond",
    payload,
  );
  return response.data;
};
