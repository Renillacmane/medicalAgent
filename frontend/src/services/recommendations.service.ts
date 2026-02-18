import { authGet } from "@/lib/api";
import type { DailyRecommendationResponse } from "@/types/recommendations";

/** GET /recommendations/daily */
export async function getDailyRecommendations(): Promise<DailyRecommendationResponse> {
  return authGet<DailyRecommendationResponse>("/recommendations/daily");
}
