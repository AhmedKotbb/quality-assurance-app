import { z } from 'zod';
import { RecommendationCategory } from '../../common/enums';

export const RecommendationSchema = z.object({
  priority: z.number().int().positive(),
  issue: z.string().min(1),
  action: z.string().min(1),
  category: z.enum([
    RecommendationCategory.RAW_MIX,
    RecommendationCategory.KILN,
    RecommendationCategory.GRINDING,
  ]),
  impact: z.string().optional(),
});

export const RecommendationArraySchema = z.array(RecommendationSchema);

export type RecommendationDto = z.infer<typeof RecommendationSchema>;
