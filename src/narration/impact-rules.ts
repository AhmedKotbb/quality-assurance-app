import { RecommendationCategory } from '../common/enums';

export type DeviationDirection = 'high' | 'low';

export interface ImpactRule {
  impact: string;
  action: string;
  category: RecommendationCategory;
  issue: string;
}

/**
 * Static cement-chemistry impact map. Not AI-generated —
 * used as the template narrator source of truth and as LLM grounding context.
 */
export const IMPACT_RULES: Record<
  string,
  Partial<Record<DeviationDirection, ImpactRule>>
> = {
  MgO: {
    high: {
      issue: 'MgO above Type I ceiling',
      impact:
        'Elevated magnesia increases risk of delayed expansion and unsoundness in hardened concrete.',
      action:
        'Reduce dolomitic / high-MgO limestone in the raw mix and re-check kiln feed chemistry.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  SO3: {
    high: {
      issue: 'SO3 near or above limit relative to C3A',
      impact:
        'Excess sulfate can cause false set, delayed ettringite risks, and unstable setting behavior.',
      action:
        'Reduce gypsum addition at grinding by ~0.2–0.3% and re-check setting time.',
      category: RecommendationCategory.GRINDING,
    },
  },
  LOI: {
    high: {
      issue: 'Loss on ignition too high',
      impact:
        'High LOI often indicates incomplete calcination, prehydration, or carbonation and can hurt strength consistency.',
      action:
        'Review clinker storage / cement aging and verify kiln burning completeness before release.',
      category: RecommendationCategory.KILN,
    },
  },
  IR: {
    high: {
      issue: 'Insoluble residue above limit',
      impact:
        'High IR points to contamination or underburned material that dilutes reactive clinker phases.',
      action:
        'Inspect raw materials for contaminants and confirm kiln temperature / residence time.',
      category: RecommendationCategory.KILN,
    },
  },
  freeLime: {
    high: {
      issue: 'Free lime elevated',
      impact:
        'High free lime can cause delayed expansion, unsoundness, and poor dimensional stability.',
      action:
        'Improve burning zone conditions or reduce lime saturation in the raw mix, then retest soundness.',
      category: RecommendationCategory.KILN,
    },
  },
  LSF: {
    high: {
      issue: 'LSF above process band',
      impact:
        'High lime saturation raises free-lime risk and can leave hard-burned, less reactive clinker.',
      action:
        'Reduce CaO-bearing feed proportionally and stabilize kiln burning before increasing throughput.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'LSF below process band',
      impact:
        'Low lime saturation reduces C3S formation and typically weakens early strength development.',
      action:
        'Increase calcareous component in the raw mix and confirm Bogue C3S after the next sample.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  SR: {
    high: {
      issue: 'Silica ratio high',
      impact:
        'High SR can make the mix harder to burn and reduce liquid phase for clinker nodulization.',
      action:
        'Increase alumina/iron flux components slightly or reduce siliceous feed.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Silica ratio low',
      impact:
        'Low SR increases melt and may produce soft, dusty clinker with lower strength potential.',
      action: 'Increase silica-bearing raw materials and rebalance fluxes.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  AR: {
    high: {
      issue: 'Alumina ratio high',
      impact:
        'High AR increases C3A potential — more heat of hydration and weaker sulfate resistance.',
      action:
        'Raise Fe2O3-bearing corrective or reduce high-alumina clay in the raw mix.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Alumina ratio low',
      impact:
        'Low AR shifts toward C4AF, changing set behavior and early strength profile.',
      action:
        'Increase aluminous clay fraction or reduce iron corrective in kiln feed.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  C3A: {
    high: {
      issue: 'C3A above advisory band',
      impact:
        'High C3A raises heat of hydration and reduces sulfate resistance; SO3 ceiling also tightens.',
      action:
        'Lower alumina in raw mix and keep gypsum addition aligned with the resulting C3A.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  C3S: {
    low: {
      issue: 'C3S below advisory band',
      impact: 'Low alite typically weakens early-age compressive strength.',
      action:
        'Raise LSF carefully and ensure adequate burning to form C3S without free-lime spikes.',
      category: RecommendationCategory.KILN,
    },
  },
  blaineFineness: {
    low: {
      issue: 'Blaine fineness below ASTM minimum',
      impact: 'Coarse cement slows hydration and early strength gain.',
      action:
        'Increase grinding time / separator cut and re-check Blaine and 3-day strength.',
      category: RecommendationCategory.GRINDING,
    },
  },
  initialSettingTimeMin: {
    low: {
      issue: 'Initial setting time too short',
      impact: 'Flash or false set risks complicate placement and finishing.',
      action:
        'Review gypsum form/amount and mill temperature; avoid dehydrating gypsum in grinding.',
      category: RecommendationCategory.GRINDING,
    },
  },
  finalSettingTimeMin: {
    high: {
      issue: 'Final setting time too long',
      impact:
        'Delayed set can hurt construction scheduling and early strength.',
      action:
        'Check sulfate balance, fineness, and possible retarding contaminants.',
      category: RecommendationCategory.GRINDING,
    },
  },
  autoclaveExpansionPct: {
    high: {
      issue: 'Autoclave expansion above limit',
      impact: 'Indicates potential unsoundness from free lime or periclase.',
      action:
        'Address free lime / MgO sources and hold the lot pending soundness clearance.',
      category: RecommendationCategory.KILN,
    },
  },
  soundnessMm: {
    high: {
      issue: 'Soundness expansion elevated',
      impact:
        'Expansion risk in hardened paste; lot may be unsuitable for structural use.',
      action: 'Investigate free lime and MgO, then retest before release.',
      category: RecommendationCategory.KILN,
    },
  },
  compressiveStrengthDay3: {
    low: {
      issue: '3-day compressive strength below ASTM minimum',
      impact: 'Early strength failure against Type I requirements.',
      action:
        'Review C3S, fineness, and gypsum; increase Blaine or alite as needed and retest.',
      category: RecommendationCategory.GRINDING,
    },
  },
  compressiveStrengthDay7: {
    low: {
      issue: '7-day compressive strength below ASTM minimum',
      impact: 'Intermediate strength shortfall against Type I requirements.',
      action:
        'Cross-check chemistry, fineness, and curing of the strength cubes; adjust grinding if Blaine is low.',
      category: RecommendationCategory.GRINDING,
    },
  },
  compressiveStrengthDay28: {
    low: {
      issue: '28-day compressive strength below ASTM minimum',
      impact:
        'Ultimate strength shortfall — lot does not meet Type I mechanical criteria.',
      action:
        'Investigate clinker quality and cement composition; quarantine lot pending root-cause review.',
      category: RecommendationCategory.KILN,
    },
  },
};
