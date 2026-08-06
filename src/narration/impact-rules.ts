import { RecommendationCategory } from '../common/enums';

export type DeviationDirection = 'high' | 'low';

export interface ImpactRule {
  impact: string;
  action: string;
  category: RecommendationCategory;
  issue: string;
}

export const IMPACT_RULES: Record<
  string,
  Partial<Record<DeviationDirection, ImpactRule>>
> = {
  CaO: {
    high: {
      issue: 'CaO above Type I process band',
      impact:
        'Excess lime raises LSF and alite potential but increases free-lime risk, harder burning, and unsoundness if CaO remains uncombined.',
      action:
        'Reduce limestone / calcareous feed proportionally, rebalance SiO2–Al2O3–Fe2O3, and re-check LSF and free lime.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'CaO below Type I process band',
      impact:
        'Low lime saturation shifts Bogue balance toward belite (C2S), weakening early-age strength typical of Type I OPC.',
      action:
        'Increase calcareous component in the kiln feed and confirm LSF and Bogue C3S on the next sample.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  SiO2: {
    high: {
      issue: 'SiO2 above Type I process band',
      impact:
        'High silica raises the silica ratio, reduces liquid phase, and makes the mix harder to burn with poorer clinker nodulization.',
      action:
        'Cut siliceous sand/sandstone feed or add alumina/iron flux correctives to restore SR into band.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'SiO2 below Type I process band',
      impact:
        'Low silica lowers calcium-silicate potential and SR, favoring excess melt and soft/dusty clinker with weaker strength potential.',
      action:
        'Increase silica-bearing raw materials and rebalance fluxes so SR returns to ~2.0–3.0.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  Al2O3: {
    high: {
      issue: 'Al2O3 above Type I process band',
      impact:
        'High alumina elevates C3A and AR — more heat of hydration, faster set, weaker sulfate resistance, and stickier kiln coating.',
      action:
        'Reduce high-alumina clay/bauxite or raise Fe2O3 corrective to bring AR and C3A back toward target.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Al2O3 below Type I process band',
      impact:
        'Low alumina reduces liquid-phase volume and C3A, making the mix harder to burn and slowing early set/strength response.',
      action:
        'Increase aluminous clay fraction in the raw mix and verify AR and Bogue C3A after adjustment.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  Fe2O3: {
    high: {
      issue: 'Fe2O3 above Type I process band',
      impact:
        'Excess iron forms more C4AF, darkens cement color, and can make the clinker melt overly fluid — raising ring/coating risks while lowering early strength contribution.',
      action:
        'Reduce iron-ore / mill-scale corrective and re-check AR, C4AF, and kiln coating stability.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Fe2O3 below Type I process band',
      impact:
        'Low iron raises AR toward C3A, reduces flux for combinability, and can leave hard-to-burn feed with lighter clinker color.',
      action:
        'Add Fe2O3-bearing corrective to restore flux and target AR (~1.3–2.5), then confirm free lime.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  MgO: {
    high: {
      issue: 'MgO above Type I ceiling',
      impact:
        'Elevated magnesia (periclase) increases risk of delayed expansion and unsoundness in hardened concrete (ASTM C150 Table 1 ≤ 6.0%).',
      action:
        'Reduce dolomitic / high-MgO limestone in the raw mix and re-check kiln feed chemistry and autoclave expansion.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  SO3: {
    high: {
      issue: 'SO3 near or above limit relative to C3A',
      impact:
        'Excess sulfate can cause false set, delayed ettringite risks, and unstable setting behavior; ASTM ceiling tightens when C3A is high.',
      action:
        'Reduce gypsum addition at grinding by ~0.2–0.3% and re-check setting time and SO3 vs Bogue C3A.',
      category: RecommendationCategory.GRINDING,
    },
  },
  LOI: {
    high: {
      issue: 'Loss on ignition too high',
      impact:
        'High LOI often indicates incomplete calcination, prehydration, or carbonation and can hurt strength consistency (ASTM C150 Table 1).',
      action:
        'Review clinker storage / cement aging and verify kiln burning completeness before release.',
      category: RecommendationCategory.KILN,
    },
  },
  IR: {
    high: {
      issue: 'Insoluble residue above limit',
      impact:
        'High IR points to contamination or underburned material that dilutes reactive clinker phases (ASTM C150 Table 1 ≤ 1.5%).',
      action:
        'Inspect raw materials for contaminants and confirm kiln temperature / residence time.',
      category: RecommendationCategory.KILN,
    },
  },
  freeLime: {
    high: {
      issue: 'Free lime elevated',
      impact:
        'Uncombined CaO can cause delayed expansion, unsoundness, and poor dimensional stability in hardened paste.',
      action:
        'Improve burning-zone conditions or reduce lime saturation in the raw mix, then retest soundness.',
      category: RecommendationCategory.KILN,
    },
  },

  LSF: {
    high: {
      issue: 'LSF above process band',
      impact:
        'High lime saturation (typically >0.98) raises free-lime risk, fuel demand, and can leave hard-burned, less reactive clinker.',
      action:
        'Reduce CaO-bearing feed proportionally and stabilize kiln burning before increasing throughput.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'LSF below process band',
      impact:
        'Low lime saturation reduces alite (C3S) formation and typically weakens early strength development.',
      action:
        'Increase calcareous component in the raw mix and confirm Bogue C3S after the next sample.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  SR: {
    high: {
      issue: 'Silica ratio high',
      impact:
        'High SR (SiO2/(Al2O3+Fe2O3)) means more silicates but less liquid phase — harder burnability and poorer nodulization.',
      action:
        'Increase alumina/iron flux components slightly or reduce siliceous feed.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Silica ratio low',
      impact:
        'Low SR increases melt volume and may produce soft, dusty clinker with lower silicate strength potential.',
      action: 'Increase silica-bearing raw materials and rebalance fluxes.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  AR: {
    high: {
      issue: 'Alumina ratio high',
      impact:
        'High AR (Al2O3/Fe2O3) increases C3A vs C4AF — more heat of hydration, faster set, and weaker sulfate resistance.',
      action:
        'Raise Fe2O3-bearing corrective or reduce high-alumina clay in the raw mix.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Alumina ratio low',
      impact:
        'Low AR shifts toward C4AF: darker color, slower early strength, more fluid melt, and better sulfate resistance.',
      action:
        'Increase aluminous clay fraction or reduce iron corrective in kiln feed.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  oxideSum: {
    high: {
      issue: 'Reported oxide sum above plausibility band',
      impact:
        'Sums well above ~105% usually indicate calibration bias, double-counting, or reporting error — Bogue phases and moduli become unreliable.',
      action:
        'Re-run XRF/wet chemistry against a certified reference material and withhold process changes until the analysis is verified.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'Reported oxide sum below plausibility band',
      impact:
        'Sums well below ~95% suggest incomplete analysis or missing oxides; LSF/SR/AR and Bogue estimates should not drive kiln decisions.',
      action:
        'Repeat the full oxide analysis (including minors if used), check sample prep/fusion, and re-evaluate only after a plausible sum is obtained.',
      category: RecommendationCategory.RAW_MIX,
    },
  },

  C3S: {
    low: {
      issue: 'C3S below advisory band',
      impact:
        'Low alite typically weakens early-age compressive strength (C3S dominates strength through ~28 days).',
      action:
        'Raise LSF carefully and ensure adequate burning to form C3S without free-lime spikes.',
      category: RecommendationCategory.KILN,
    },
  },
  C2S: {
    high: {
      issue: 'C2S above advisory band',
      impact:
        'Belite-rich clinker hydrates slowly — early strength drops while long-term gain may improve (more Type IV-like behavior).',
      action:
        'Raise LSF / available lime and improve burning so belite converts to alite; re-check Bogue C3S:C2S.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'C2S below advisory band',
      impact:
        'Very low belite limits later-age strength contribution and often signals an over-limed mix with elevated free-lime risk.',
      action:
        'Verify CaO/LSF and free lime; if LSF is high, ease calcareous feed slightly and confirm phase balance.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  C3A: {
    high: {
      issue: 'C3A above advisory band',
      impact:
        'High C3A raises heat of hydration and reduces sulfate resistance; the ASTM SO3 ceiling also tightens when C3A > 8%.',
      action:
        'Lower alumina in raw mix and keep gypsum addition aligned with the resulting C3A.',
      category: RecommendationCategory.RAW_MIX,
    },
  },
  C4AF: {
    high: {
      issue: 'C4AF above advisory band',
      impact:
        'Excess ferrite darkens OPC, contributes little strength, and can overly fluidize kiln melt while improving sulfate resistance.',
      action:
        'Reduce Fe2O3 corrective in the raw mix and re-check AR and liquid-phase behavior.',
      category: RecommendationCategory.RAW_MIX,
    },
    low: {
      issue: 'C4AF below advisory band',
      impact:
        'Low ferrite reduces flux for clinkering, making the mix harder to burn and shifting the aluminate balance toward C3A if Al2O3 stays high.',
      action:
        'Increase iron-bearing corrective to restore C4AF flux, then confirm free lime and burnability.',
      category: RecommendationCategory.RAW_MIX,
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
