import type { ImageSourcePropType } from 'react-native';

import type { IllustrationKind } from '@/shared/components/Illustration';
import { images } from '@/shared/media';

/** Pre-hydrate profile shell — live data from GET /me replaces this on sign-in. */
export const userProfile = {
  name: '',
  fullName: '',
  email: '',
  bio: '' as string,
  avatar: images.avatarIsaac as number | undefined,
  avatarUrl: null as string | null,
  level: 1,
  xp: 0,
  totalXp: 0,
  xpToNext: 100,
  streak: 0,
  carbonSavedKg: 0,
  lessonsCompleted: 0,
  missionsCompleted: 0,
  badgesUnlocked: 0,
  referralCode: '',
  region: 'Greater Accra' as GhanaRegion,
  showOnLeaderboard: true,
};

export type UserProfile = typeof userProfile;

/** 16 administrative regions of Ghana (for local leaderboards). */
export const GHANA_REGIONS = [
  'Ahafo',
  'Ashanti',
  'Bono',
  'Bono East',
  'Central',
  'Eastern',
  'Greater Accra',
  'North East',
  'Northern',
  'Oti',
  'Savannah',
  'Upper East',
  'Upper West',
  'Volta',
  'Western',
  'Western North',
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

export const interests = [
  { id: 'recycling', label: 'Recycling', icon: 'recycle', tint: '#2E7D32', soft: '#E8F5E9' },
  { id: 'trees', label: 'Trees & Forests', icon: 'trees', tint: '#15803D', soft: '#ECFDF3' },
  { id: 'water', label: 'Water Conservation', icon: 'droplet', tint: '#0284C7', soft: '#E0F2FE' },
  { id: 'energy', label: 'Renewable Energy', icon: 'zap', tint: '#CA8A04', soft: '#FEF9C3' },
  { id: 'agriculture', label: 'Agriculture', icon: 'sprout', tint: '#65A30D', soft: '#F7FEE7' },
  { id: 'climate', label: 'Climate Change', icon: 'globe', tint: '#2563EB', soft: '#DBEAFE' },
  { id: 'wildlife', label: 'Wildlife', icon: 'turtle', tint: '#0D9488', soft: '#CCFBF1' },
  { id: 'air', label: 'Air Pollution', icon: 'factory', tint: '#64748B', soft: '#F1F5F9' },
  { id: 'ocean', label: 'Ocean Health', icon: 'waves', tint: '#0369A1', soft: '#E0F2FE' },
  { id: 'waste', label: 'Waste Reduction', icon: 'trash', tint: '#EA580C', soft: '#FFF7ED' },
] as const;

export type InterestIcon = (typeof interests)[number]['icon'];

export type LessonInstructor = {
  name: string;
  role: string;
  avatar: (typeof images)[keyof typeof images];
};

export type Lesson = {
  id: string;
  title: string;
  topic: string;
  minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  xp: number;
  learners: number;
  instructor: LessonInstructor;
  illustration: IllustrationKind;
  cover: (typeof images)[keyof typeof images];
  facts: string[];
  summary: string;
  video?: {
    title: string;
    youtubeId: string;
    durationMin: number;
    applyInDailyLife: string;
  };
  glossaryTermIds?: string[];
  /** Weekly Ghana action — from course seed (also on video when present). */
  applyInDailyLife?: string;
  unitId?: string | null;
  lessonOrder?: number;
  curriculumNo?: number | null;
  interestTags?: string[];
  sortOrder?: number;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minutes: number;
  impact: string;
  illustration: IllustrationKind;
  cover: ImageSourcePropType;
  evidenceImage: ImageSourcePropType;
  checklist: string[];
  completed?: boolean;
};

export type ClimateTerm = {
  id: string;
  term: string;
  plainMeaning: string;
  applyDaily: string;
};

/** Short climate glossary — meaning + how to apply in daily Ghana life. */
export const climateGlossary: ClimateTerm[] = [
  {
    id: 'greenhouse-effect',
    term: 'Greenhouse effect',
    plainMeaning:
      'Gases in the air (like CO₂ and methane) trap heat from the sun, warming the planet—like a closed car on a hot Accra afternoon.',
    applyDaily:
      'Walk or trotro when you can, cut needless charcoal waste, and refuse one plastic item a day to lower the heat-trapping gases you help create.',
  },
  {
    id: 'adaptation',
    term: 'Adaptation',
    plainMeaning:
      'Adjusting how we live so floods, heat, and dry spells hurt us less—even while the climate keeps changing.',
    applyDaily:
      'Clear plastics from drains before rains, plant shade trees, store rainwater in a drum, and keep a refill bottle for hot days.',
  },
  {
    id: 'mitigation',
    term: 'Mitigation',
    plainMeaning:
      'Actions that reduce greenhouse gases so warming slows—less burning, less waste rotting, more clean energy.',
    applyDaily:
      'Sort recyclables, compost kitchen peels, switch idle lights off, and support solar or grid power over diesel when you have a choice.',
  },
  {
    id: 'circular-economy',
    term: 'Circular economy',
    plainMeaning:
      'Keeping materials in use: reuse, repair, and recycle instead of “take–make–dump.”',
    applyDaily:
      'Rinse and bag PET/sachets for collection, refill bottles, repair shoes/bags, and pass usable clothes to someone else.',
  },
  {
    id: 'methane',
    term: 'Methane',
    plainMeaning:
      'A strong heat-trapping gas that comes from rotting food waste, some farming, and leaks—more powerful than CO₂ over short periods.',
    applyDaily:
      'Don’t leave food scraps in open dumps; use a covered scrap bucket for compost or garden soil.',
  },
  {
    id: 'waste-segregation',
    term: 'Waste segregation',
    plainMeaning:
      'Separating trash at home so recyclables and organics don’t mix with dirty mixed waste.',
    applyDaily:
      'Two bags tonight: clean plastics vs mixed trash. Label them so the whole household can follow.',
  },
  {
    id: 'renewable-energy',
    term: 'Renewable energy',
    plainMeaning:
      'Power from sources that replenish—solar, wind, sustainable hydro—instead of only diesel and coal.',
    applyDaily:
      'Unplug idle chargers; ask about solar lanterns for study light when the grid is down.',
  },
  {
    id: 'carbon-footprint',
    term: 'Carbon footprint',
    plainMeaning:
      'The total greenhouse gases linked to your activities—travel, cooking fuel, electricity, and stuff you buy.',
    applyDaily:
      'Track one week: sachets bought, charcoal used, generator hours. Cut one item next week.',
  },
  {
    id: 'energy-efficiency',
    term: 'Energy efficiency',
    plainMeaning:
      'Getting the same light, cool air, or cooked meal while using less fuel or electricity.',
    applyDaily:
      'Cook with lids on, match pot size to the fire, and turn off fans/lights when you leave a room.',
  },
  {
    id: 'microplastics',
    term: 'Microplastics',
    plainMeaning:
      'Tiny plastic bits that form when bags, bottles, and sachets break down—and can enter water and food.',
    applyDaily:
      'Refuse thin bags, don’t burn plastic, and keep sachets out of drains and rivers.',
  },
  {
    id: 'single-use-plastic',
    term: 'Single-use plastic',
    plainMeaning:
      'Items used once then thrown—sachets, thin bags, straws—that clog Ghana’s gutters and beaches.',
    applyDaily:
      'Carry a refill bottle and say no to an extra bag at the market when you already have one.',
  },
  {
    id: 'watershed',
    term: 'Watershed',
    plainMeaning:
      'The land area that drains rain into a river, stream, or lake—what happens upstream affects people downstream.',
    applyDaily:
      'Don’t dump waste near streams; protect trees on slopes and keep plastics out of gutters that feed rivers.',
  },
  {
    id: 'water-scarcity',
    term: 'Water scarcity',
    plainMeaning:
      'When there isn’t enough clean water for people, farms, or cities—often worse in dry seasons.',
    applyDaily:
      'Fix drips, reuse wash water on plants, and harvest roof rain into a covered container.',
  },
  {
    id: 'climate-smart-agriculture',
    term: 'Climate-smart agriculture',
    plainMeaning:
      'Farming that boosts food, strengthens farms against climate shocks, and cuts emissions where possible.',
    applyDaily:
      'Mulch garden beds, compost peels, and plant diverse crops or shade trees if you farm or garden.',
  },
  {
    id: 'agroforestry',
    term: 'Agroforestry',
    plainMeaning:
      'Growing trees together with crops or livestock so soil, shade, and income improve together.',
    applyDaily:
      'Care for a young tree near home or school; add dry-leaf mulch and water at the base.',
  },
  {
    id: 'food-security',
    term: 'Food security',
    plainMeaning:
      'Reliable access to enough nutritious food—threatened when rains fail or prices spike.',
    applyDaily:
      'Buy local/seasonal when you can, cut food waste, and share surplus with neighbours.',
  },
];

export type LeaderboardEntry = {
  rank: number;
  name: string;
  shortName: string;
  initials: string;
  xp: number;
  country: string;
  flag: string;
  region: GhanaRegion;
  delta: number;
  avatarColor: string;
  avatar: ImageSourcePropType;
  you: boolean;
};

export type CommunityReportKind = 'trash' | 'blocked-drain' | 'dumping' | 'other';

export type CommunityReport = {
  id: string;
  kind: CommunityReportKind;
  title: string;
  caption: string;
  location: string;
  latitude: number;
  longitude: number;
  distance: string;
  timeAgo: string;
  upvotes: number;
  downvotes: number;
  author: string;
  authorAvatar: ImageSourcePropType;
  photo: ImageSourcePropType;
  you?: boolean;
  myVote?: 'up' | 'down';
  createdAt?: string;
};

export const voiceSuggestions = [
  'Start today’s lesson',
  'What is renewable energy?',
  'How many XP do I have?',
  'Explain climate change',
];
