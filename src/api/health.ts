import { apiClient } from "@/api/client";
import type { PingResponse } from "@/types/api";

export const ping = async () => {
  const response = await apiClient.get<PingResponse>("/ping");
  return response.data;
};
