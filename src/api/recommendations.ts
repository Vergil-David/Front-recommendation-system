import { apiClient } from "@/api/client";
import type { Movie } from "@/api/movies";

export type InteractionType = "viewed" | "liked" | "disliked" | "favorite" | "skipped";

export type MovieInteractionState = {
  viewed: boolean;
  liked: boolean;
  disliked: boolean;
  favorite: boolean;
  skipped: boolean;
};

export type InteractionStatesResponse = {
  items: Record<string, MovieInteractionState>;
};

export type CreateInteractionResponse = {
  status: string;
};

export type RecommendationMovie = Movie & {
  score: number;
  reason: string;
};

export type RecommendationsResponse = {
  items: RecommendationMovie[];
  total: number;
  offset: number;
  has_more: boolean;
};

export type FriendRecommendation = {
  id: number;
  title: string;
  description: string;
  release_year: number;
  image_url: string;
  score: number;
  reason: string;
};

export type FriendRecommendationsResponse = {
  items: FriendRecommendation[];
};

export const createInteraction = async (itemId: number, type: InteractionType) => {
  const response = await apiClient.post<CreateInteractionResponse>("/interactions", {
    item_id: itemId,
    type,
  });

  return response.data;
};

export const getInteractionStates = async (itemIds: number[]) => {
  if (itemIds.length === 0) {
    return { items: {} } satisfies InteractionStatesResponse;
  }

  const response = await apiClient.get<InteractionStatesResponse>("/interactions/items", {
    params: { ids: itemIds.join(",") },
  });

  return response.data;
};

export const getRecommendations = async (limit = 20, offset = 0) => {
  const response = await apiClient.get<RecommendationsResponse>("/recommendations", {
    params: { limit, offset },
  });

  return response.data;
};

export const getFriendRecommendations = async (limit = 20) => {
  const response = await apiClient.get<FriendRecommendationsResponse>("/recommendations/friends", {
    params: { limit },
  });

  return response.data;
};
