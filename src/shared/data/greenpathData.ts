import type { IllustrationKind } from '@/shared/components/Illustration';
import { images } from '@/shared/media';

export const userProfile = {
  name: 'Isaac',
  fullName: 'Isaac Mensah',
  email: 'isaac@greenpath.gh',
  avatar: images.avatarIsaac,
  level: 7,
  xp: 2450,
  xpToNext: 3000,
  streak: 12,
  carbonSavedKg: 12,
  lessonsCompleted: 18,
  missionsCompleted: 24,
  badgesUnlocked: 8,
};

export const interests = [
  { id: 'recycling', label: '♻ Recycling' },
  { id: 'trees', label: '🌳 Trees' },
  { id: 'water', label: '💧 Water' },
  { id: 'energy', label: '⚡ Renewable Energy' },
  { id: 'agriculture', label: '🌱 Agriculture' },
  { id: 'climate', label: '🌎 Climate Change' },
  { id: 'wildlife', label: '🐢 Wildlife' },
] as const;

export type Lesson = {
  id: string;
  title: string;
  topic: string;
  minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  progress: number;
  illustration: IllustrationKind;
  cover: (typeof images)[keyof typeof images];
  facts: string[];
  summary: string;
};

export const lessons: Lesson[] = [
  {
    id: 'climate',
    title: 'Climate Change Basics',
    topic: 'Climate Change',
    minutes: 8,
    difficulty: 'Beginner',
    progress: 0.7,
    illustration: 'climate',
    cover: images.landingHero,
    summary:
      'Understand how rising temperatures affect Ghana’s communities, coastlines, and farms.',
    facts: [
      'Ghana’s average temperature has risen by about 1°C since 1960.',
      'Coastal flooding threatens Accra and other low-lying cities.',
      'Youth action can cut emissions through daily habits.',
    ],
  },
  {
    id: 'waste',
    title: 'Waste Management',
    topic: 'Waste Management',
    minutes: 10,
    difficulty: 'Beginner',
    progress: 1,
    illustration: 'recycle',
    cover: images.landingHero,
    summary: 'Learn to sort, reduce, and recycle waste in your neighborhood.',
    facts: [
      'Recycling one tonne of plastic saves ~1.5 tonnes of CO₂.',
      'Composting food waste cuts methane from landfills.',
      'Clean drains reduce flooding in rainy seasons.',
    ],
  },
  {
    id: 'solar',
    title: 'Solar Energy',
    topic: 'Solar Energy',
    minutes: 12,
    difficulty: 'Intermediate',
    progress: 0.35,
    illustration: 'solar',
    cover: images.landingHero,
    summary: 'Discover how sunshine powers homes, schools, and clinics across Ghana.',
    facts: [
      'Ghana receives abundant solar irradiance year-round.',
      'Solar mini-grids bring light to off-grid communities.',
      'Clean energy reduces reliance on diesel generators.',
    ],
  },
  {
    id: 'plastic',
    title: 'Plastic Pollution',
    topic: 'Plastic Pollution',
    minutes: 9,
    difficulty: 'Beginner',
    progress: 0.15,
    illustration: 'plastic',
    cover: images.landingHero,
    summary: 'See how single-use plastics harm rivers, wildlife, and health.',
    facts: [
      'Plastic can take hundreds of years to break down.',
      'Microplastics enter food chains through water and fish.',
      'Reusable bottles and bags cut daily plastic waste.',
    ],
  },
  {
    id: 'water',
    title: 'Water Conservation',
    topic: 'Water Conservation',
    minutes: 7,
    difficulty: 'Beginner',
    progress: 0.5,
    illustration: 'water',
    cover: images.landingHero,
    summary: 'Simple ways to protect Ghana’s rivers, wells, and clean water access.',
    facts: [
      'A dripping tap can waste litres every day.',
      'Rainwater harvesting supports dry-season needs.',
      'Protecting watershed forests keeps water clean.',
    ],
  },
  {
    id: 'agri',
    title: 'Sustainable Agriculture',
    topic: 'Sustainable Agriculture',
    minutes: 14,
    difficulty: 'Advanced',
    progress: 0,
    illustration: 'agriculture',
    cover: images.landingHero,
    summary: 'Grow food with healthier soils, less waste, and climate-smart practices.',
    facts: [
      'Cover crops protect soil from erosion.',
      'Agroforestry mixes trees with crops for resilience.',
      'Local markets cut transport emissions.',
    ],
  },
];

export type Mission = {
  id: string;
  title: string;
  description: string;
  xp: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  minutes: number;
  impact: string;
  illustration: IllustrationKind;
  checklist: string[];
};

export const missions: Mission[] = [
  {
    id: 'bottles',
    title: 'Recycle five plastic bottles',
    description:
      'Collect five clean plastic bottles from home or school and drop them at a recycling point.',
    xp: 100,
    difficulty: 'Easy',
    minutes: 15,
    impact: '0.4 kg CO₂ saved',
    illustration: 'recycle',
    checklist: ['Collect 5 bottles', 'Rinse & dry', 'Drop off at recycling point'],
  },
  {
    id: 'water-save',
    title: 'Save water today',
    description: 'Turn off taps while brushing, fix a drip, or reuse rinse water for plants.',
    xp: 80,
    difficulty: 'Easy',
    minutes: 10,
    impact: '0.2 kg CO₂ saved',
    illustration: 'water',
    checklist: ['Pick one water habit', 'Practice all day', 'Note how much you saved'],
  },
  {
    id: 'plant',
    title: 'Plant a tree',
    description: 'Plant a seedling in your yard, school, or community garden and water it in.',
    xp: 200,
    difficulty: 'Medium',
    minutes: 45,
    impact: '5 kg CO₂ saved each year',
    illustration: 'tree',
    checklist: ['Prepare soil', 'Plant seedling', 'Water thoroughly'],
  },
  {
    id: 'cleanup',
    title: 'Community cleanup',
    description: 'Join or start a 30-minute litter pickup on your street or school compound.',
    xp: 150,
    difficulty: 'Medium',
    minutes: 30,
    impact: 'Cleaner community',
    illustration: 'community',
    checklist: ['Gather gloves/bags', 'Clean for 30 mins', 'Sort recyclables'],
  },
  {
    id: 'lights',
    title: 'Turn off unused lights',
    description: 'Do a home energy sweep. Switch off lights and chargers you are not using.',
    xp: 60,
    difficulty: 'Easy',
    minutes: 5,
    impact: '0.1 kg CO₂ saved',
    illustration: 'energy',
    checklist: ['Walk through rooms', 'Switch off extras', 'Unplug idle chargers'],
  },
];

export const quizQuestions = [
  {
    id: 'q1',
    prompt: 'Which action best reduces plastic pollution in your community?',
    options: [
      'Burn plastic waste outdoors',
      'Use reusable bottles and bags',
      'Dump plastic in rivers',
      'Ignore single-use plastics',
    ],
    correctIndex: 1,
  },
  {
    id: 'q2',
    prompt: 'Renewable energy in Ghana often comes from…',
    options: ['Coal only', 'Solar and hydro', 'Plastic burning', 'Imported diesel only'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    prompt: 'Planting trees helps the climate mainly by…',
    options: [
      'Absorbing carbon dioxide',
      'Creating more plastic',
      'Heating the air',
      'Blocking rainfall forever',
    ],
    correctIndex: 0,
  },
  {
    id: 'q4',
    prompt: 'A simple daily water-saving habit is…',
    options: [
      'Leaving taps running',
      'Fixing leaks and shorter showers',
      'Washing cars daily with hose',
      'Pouring clean water away',
    ],
    correctIndex: 1,
  },
];

export const badges = [
  { id: 'waste', name: 'Waste Warrior', unlocked: true, illustration: 'recycle' as const },
  { id: 'hero', name: 'Climate Hero', unlocked: true, illustration: 'climate' as const },
  { id: 'recycle', name: 'Recycling Champion', unlocked: true, illustration: 'badge' as const },
  { id: 'eco', name: 'Eco Leader', unlocked: false, illustration: 'trophy' as const },
  { id: 'tree', name: 'Tree Guardian', unlocked: false, illustration: 'tree' as const },
  { id: 'water', name: 'Water Saver', unlocked: true, illustration: 'water' as const },
];

export const leaderboard = [
  { rank: 1, name: 'Ama Boateng', xp: 4820, you: false },
  { rank: 2, name: 'Kwame Asante', xp: 4510, you: false },
  { rank: 3, name: 'Isaac Mensah', xp: 2450, you: true },
  { rank: 4, name: 'Efua Darko', xp: 2310, you: false },
  { rank: 5, name: 'Yaw Owusu', xp: 2105, you: false },
];

export const events = [
  {
    id: 'e1',
    title: 'Accra Tree Planting Day',
    location: 'Legon Botanical Gardens',
    date: 'Sat, 12 Apr',
    time: '9:00 AM',
    participants: 128,
    capacity: 150,
    illustration: 'tree' as const,
    attendees: [
      { name: 'Ama', source: images.avatar1 },
      { name: 'Kwame', source: images.avatar2 },
      { name: 'Efua', source: images.avatar3 },
      { name: 'Yaw', source: images.avatar4 },
    ],
  },
  {
    id: 'e2',
    title: 'Beach Cleanup Labadi',
    location: 'Labadi Beach',
    date: 'Sun, 13 Apr',
    time: '7:30 AM',
    participants: 86,
    capacity: 100,
    illustration: 'community' as const,
    attendees: [
      { name: 'Kwame', source: images.avatar2 },
      { name: 'Isaac', source: images.avatarIsaac },
      { name: 'Ama', source: images.avatar1 },
      { name: 'Efua', source: images.avatar3 },
    ],
  },
  {
    id: 'e3',
    title: 'Youth Climate Workshop',
    location: 'Kumasi Innovation Hub',
    date: 'Wed, 16 Apr',
    time: '4:00 PM',
    participants: 54,
    capacity: 60,
    illustration: 'learn' as const,
    attendees: [
      { name: 'Efua', source: images.avatar3 },
      { name: 'Yaw', source: images.avatar4 },
      { name: 'Isaac', source: images.avatarIsaac },
    ],
  },
];

export const notifications = [
  {
    id: 'n1',
    title: 'Daily reminder',
    body: 'Your climate mission is waiting. 5 minutes to earn XP.',
    time: '8:00 AM',
    unread: true,
    kind: 'reminder' as const,
  },
  {
    id: 'n2',
    title: 'Mission completed',
    body: 'Great work! +100 XP for recycling bottles.',
    time: 'Yesterday',
    unread: true,
    kind: 'mission' as const,
  },
  {
    id: 'n3',
    title: 'New badge unlocked',
    body: 'You earned Waste Warrior. Keep going!',
    time: '2d ago',
    unread: false,
    kind: 'badge' as const,
  },
  {
    id: 'n4',
    title: 'Weekly challenge',
    body: 'Complete 3 missions this week for bonus gold.',
    time: '3d ago',
    unread: false,
    kind: 'challenge' as const,
  },
  {
    id: 'n5',
    title: 'AI recommendation',
    body: 'Review Plastic Recycling before your next quiz.',
    time: '4d ago',
    unread: false,
    kind: 'ai' as const,
  },
];

export const weeklyProgress = [
  { day: 'Mon', value: 40 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 50 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 70 },
  { day: 'Sat', value: 90 },
  { day: 'Sun', value: 55 },
];

export const voiceSuggestions = [
  'Start today’s lesson',
  'What is renewable energy?',
  'How many XP do I have?',
  'Explain climate change',
];
