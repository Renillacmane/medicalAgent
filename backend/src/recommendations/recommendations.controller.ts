import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/schemas/user.schema';
import { RecommendationsService } from './recommendations.service';
import { DailyRecommendationDto } from './dto/daily-recommendation.dto';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  /**
   * GET /recommendations/daily
   *
   * Generate daily health recommendations for the authenticated user.
   * Returns structured wellness suggestions (nutrition, exercise, lifestyle, alerts).
   *
   * All recommendations are non-critical and wellness-focused only.
   * No diagnoses, emergency advice, or medication changes.
   */
  @Get('daily')
  async getDailyRecommendations(@CurrentUser() user: User): Promise<DailyRecommendationDto> {
    const doc = user as User & { id?: string; _id?: { toString(): string } };
    const userId = doc.id ?? doc._id?.toString?.() ?? '';

    return this.recommendationsService.getDailyRecommendations(userId);
  }
}
