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
      'Ghana’s climate is already changing: hotter days, less predictable rains, and rising seas that hit farms, cities, and coastal communities first.',
    facts: [
      'Temperatures in Ghana have risen by about 1°C since the 1960s (roughly 0.21°C per decade), with more very hot days and nights—especially in the north.',
      'Rainfall is highly variable. Dry spells can delay planting, while sudden heavy rains flood Accra drains and wash away soils.',
      'Agriculture employs a large share of Ghanaians. Climate shocks hit food prices, cocoa, maize, and fishing livelihoods quickly.',
      'Sea-level rise and coastal erosion threaten communities along Ghana’s ~500 km coastline, including parts of Greater Accra.',
      'Youth action matters: cutting waste, using less charcoal wastefully, and supporting renewables all reduce local pressure on the climate system.',
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
    summary:
      'Most Ghanaian plastic never gets recycled. Sorting sachets and bottles, keeping drains clear, and composting food scraps are the actions that work today.',
    facts: [
      'Ghana generates an estimated 3,000+ metric tons of plastic waste every day—around one million tonnes a year.',
      'Only a small share of plastic is recycled (often cited around 2–9%). The rest is dumped, burned, or washed into drains and the ocean.',
      'About 86% of plastic waste is improperly disposed of, clogging gutters and rivers that should carry stormwater.',
      'The waste sector alone contributed roughly 8% of Ghana’s greenhouse gas emissions in 2016 (about 3.2 MtCO₂e), partly from rotting organic waste.',
      'Practical step: separate PET bottles and water sachets at home, then pass them to a recycler, Zoomlion pickup, or school collection point.',
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
    summary:
      'Ghana still leans on hydro and thermal power. Sunshine is abundant—and solar can light homes, schools, and clinics when dams and diesel fall short.',
    facts: [
      'Hydropower plants like Akosombo, Kpong, and Bui have powered Ghana for decades, but drought and low water levels make supply unreliable.',
      'When hydro dips, thermal plants and diesel generators fill the gap—costing more money and emitting more CO₂.',
      'Ghana has strong solar potential year-round. Solar home systems and mini-grids already bring light to communities far from the main grid.',
      'Youth skills in solar installation, maintenance, and green business are growing demand areas in Ghana’s energy transition.',
      'Every hour a diesel generator stays off because of solar is cleaner air and lower fuel cost for a household or shop.',
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
    summary:
      'Sachet water and single-use packaging are part of daily life in Ghana—and a major source of street, river, and ocean pollution.',
    facts: [
      'Ghanaians consume billions of water sachets each year—estimates around 8 billion sachets historically cited in research.',
      'World Bank estimates link Ghana to roughly 250,000 metric tons of plastic leaking toward the Atlantic Ocean.',
      'Polyethylene packaging (bags, wraps, sachets) can make up a large share of plastic in municipal waste streams.',
      'Plastic in drains worsens flooding in Accra and other cities. Clearing gutters is climate adaptation as well as cleanliness.',
      'Best personal moves: refill bottles, refuse extra bags, sort plastics for collection, and report dumping spots near you.',
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
    summary:
      'Clean water is under stress from droughts, pollution, and growing cities. Small habits protect wells, taps, and rivers.',
    facts: [
      'Studies and water agencies report that a large share of Ghana’s water bodies face pollution—plastic waste is a major driver in many urban rivers.',
      'Climate-driven dry spells reduce water for farming and household use, especially in northern and transitional zones.',
      'A dripping tap can waste litres every day. Fixing leaks is free climate action at home or school.',
      'Rainwater harvesting (even a simple drum under a roof gutter) helps in dry seasons when piped supply is irregular.',
      'Protecting trees around watersheds and keeping plastics out of drains keeps water cleaner for communities downstream.',
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
    summary:
      'Farming feeds Ghana and employs millions—but climate stress, soil loss, and post-harvest waste threaten food security.',
    facts: [
      'Agriculture remains a major part of Ghana’s economy and workforce. Weather shocks quickly affect food prices and rural incomes.',
      'Longer dry spells and unpredictable rains shorten growing seasons and raise crop-failure risk for maize, vegetables, and cocoa.',
      'Climate-smart practices—mulching, compost, agroforestry, and water-efficient irrigation—help soils hold moisture and nutrients.',
      'Solar-powered irrigation and dryers are expanding options to cut diesel use and reduce post-harvest losses.',
      'Composting kitchen and farm scraps returns nutrients to soil and cuts methane from rotting food in dumps.',
      'Buying local and seasonal food when you can shortens transport distance and supports nearby farmers.',
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
    id: 'report-nearby',
    title: 'Report trash in your surroundings',
    description:
      'Spot illegal dumping, a blocked gutter, or a plastic pile near you. Take a clear photo and note the place (street, school, market). Community reports help map problem spots for cleanups.',
    xp: 110,
    difficulty: 'Easy',
    minutes: 10,
    impact: 'Maps pollution for local action',
    illustration: 'community',
    checklist: [
      'Find a safe nearby dump, pile, or blocked drain',
      'Take a clear photo of the problem',
      'Note the location (area / landmark)',
      'Submit for review to earn XP',
    ],
  },
  {
    id: 'sachet-sort',
    title: 'Sort sachet & bottle plastics at home',
    description:
      'Separate clean PET bottles and water sachets from mixed trash for a recycler, Zoomlion pickup, or school collection point. Ghana generates huge plastic waste; sorting is the step most youth can actually do.',
    xp: 100,
    difficulty: 'Easy',
    minutes: 20,
    impact: 'Keeps plastics out of drains & gutters',
    illustration: 'recycle',
    checklist: [
      'Gather sachets and PET bottles from home',
      'Rinse and flatten or bag them',
      'Place at a known collection or recycler drop',
      'Take a photo of the sorted bag',
    ],
  },
  {
    id: 'refill-day',
    title: 'Carry a refill bottle all day',
    description:
      'Skip buying new sachet or bottled water for one school/work day. Use a reusable bottle and refill from a safe tap, filter, or vendor refill point.',
    xp: 80,
    difficulty: 'Easy',
    minutes: 5,
    impact: 'Cuts single-use plastic you would buy today',
    illustration: 'plastic',
    checklist: [
      'Fill a reusable bottle in the morning',
      'Refuse at least one sachet or new PET purchase',
      'Refill once during the day',
      'Log how many sachets you avoided',
    ],
  },
  {
    id: 'drain-guard',
    title: 'Clear plastic from a nearby drain',
    description:
      'With gloves or a bag, remove litter clogging a street gutter, school drain, or compound channel for 15–20 minutes. Flooding in Accra often starts with blocked drains.',
    xp: 150,
    difficulty: 'Medium',
    minutes: 25,
    impact: 'Reduces local flood & disease risk',
    illustration: 'community',
    checklist: [
      'Pick a safe nearby gutter or compound drain',
      'Collect plastics and litter into a bag',
      'Dispose or sort recyclables properly',
      'Photo the cleaned spot (before/after if possible)',
    ],
  },
  {
    id: 'food-waste-compost',
    title: 'Start a kitchen scrap bucket',
    description:
      'Set up a simple covered bucket for fruit/veg peels (no oil or meat). Use for home compost, a garden bed, or hand to a community compost project—common in Ghana eco-club & zero-waste models.',
    xp: 120,
    difficulty: 'Easy',
    minutes: 15,
    impact: 'Cuts methane from food waste',
    illustration: 'agriculture',
    checklist: [
      'Find a bucket or container with a lid',
      'Add today’s fruit/veg scraps only',
      'Keep it away from pests',
      'Photo the labeled scrap bucket',
    ],
  },
  {
    id: 'share-climate-tip',
    title: 'Teach one climate tip to 3 people',
    description:
      'Explain one GreenPath lesson tip (plastic, water, or energy) to three friends, family, or classmates. Advocacy + peer teaching is how youth eco-clubs in Ghana scale impact.',
    xp: 90,
    difficulty: 'Easy',
    minutes: 15,
    impact: 'Multiplies awareness beyond one user',
    illustration: 'learn',
    checklist: [
      'Pick one clear tip from a lesson',
      'Share it with 3 people in person or chat',
      'Answer one question they ask',
      'Note who you taught',
    ],
  },
  {
    id: 'tree-care',
    title: 'Water & mulch a young tree',
    description:
      'Care for an existing seedling or young tree at home, school, or a community planting site. Daily tree care beats one-off “plant a tree” when seedlings are hard to get.',
    xp: 140,
    difficulty: 'Medium',
    minutes: 20,
    impact: 'Helps a tree survive its first years',
    illustration: 'tree',
    checklist: [
      'Locate a young tree or seedling nearby',
      'Water at the base (not just the leaves)',
      'Add dry leaves/mulch if available',
      'Photo the tree you cared for',
    ],
  },
  {
    id: 'cookstove-safe',
    title: 'Safer cook-fire / charcoal use today',
    description:
      'If your household cooks with charcoal or firewood: use a lid, cook with pot size matched to the fire, and extinguish safely when done. Cuts fuel waste and household smoke.',
    xp: 100,
    difficulty: 'Easy',
    minutes: 30,
    impact: 'Uses less charcoal & cleaner indoor air',
    illustration: 'energy',
    checklist: [
      'Cover pots while cooking',
      'Avoid oversized open fires',
      'Fully extinguish charcoal when finished',
      'Note one fuel-saving change you made',
    ],
  },
];

export const quizQuestions = [
  {
    id: 'q1',
    prompt: 'About how much plastic waste does Ghana generate each day (order of magnitude)?',
    options: [
      'About 30 metric tons',
      'About 300 metric tons',
      'About 3,000+ metric tons',
      'About 30,000 metric tons',
    ],
    correctIndex: 2,
  },
  {
    id: 'q2',
    prompt: 'Why do blocked Accra drains matter for climate resilience?',
    options: [
      'They only affect tourists',
      'Plastic and litter clog gutters and worsen flooding in heavy rains',
      'They make solar panels work better',
      'They cool the city automatically',
    ],
    correctIndex: 1,
  },
  {
    id: 'q3',
    prompt: 'Temperatures in Ghana since the 1960s have…',
    options: [
      'Stayed exactly the same',
      'Fallen by about 2°C',
      'Risen by about 1°C, with more very hot days',
      'Only changed in Europe',
    ],
    correctIndex: 2,
  },
  {
    id: 'q4',
    prompt: 'When hydropower water levels are low, Ghana often relies more on…',
    options: [
      'Thermal plants and diesel generators',
      'Only wind farms',
      'Burning plastic for grid power',
      'Importing ice',
    ],
    correctIndex: 0,
  },
  {
    id: 'q5',
    prompt: 'A practical youth action that cuts sachet plastic is…',
    options: [
      'Buying more sachets “for fun”',
      'Carrying a refill bottle and refusing new sachets when you can',
      'Dumping sachets in the sea',
      'Burning sachets indoors',
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
  {
    rank: 1,
    name: 'Ama Owusu',
    shortName: 'Ama',
    initials: 'AO',
    xp: 5840,
    country: 'Ghana',
    flag: '🇬🇭',
    delta: 2,
    avatarColor: '#F97316',
    avatar: images.avatar1,
    you: false,
  },
  {
    rank: 2,
    name: 'Kwame Asante',
    shortName: 'Kwame',
    initials: 'KA',
    xp: 5200,
    country: 'Ghana',
    flag: '🇬🇭',
    delta: -1,
    avatarColor: '#3B82F6',
    avatar: images.avatar2,
    you: false,
  },
  {
    rank: 3,
    name: 'Fatima Diallo',
    shortName: 'Fatima',
    initials: 'FD',
    xp: 5000,
    country: 'Nigeria',
    flag: '🇳🇬',
    delta: 5,
    avatarColor: '#EF4444',
    avatar: images.avatar3,
    you: false,
  },
  {
    rank: 4,
    name: 'Kofi Boateng',
    shortName: 'Kofi',
    initials: 'KB',
    xp: 4680,
    country: 'Ghana',
    flag: '🇬🇭',
    delta: 0,
    avatarColor: '#8B5CF6',
    avatar: images.avatar4,
    you: false,
  },
  {
    rank: 5,
    name: 'Isaac Mensah',
    shortName: 'Isaac',
    initials: 'IM',
    xp: 2450,
    country: 'Ghana',
    flag: '🇬🇭',
    delta: 1,
    avatarColor: '#2E7D32',
    avatar: images.avatarIsaac,
    you: true,
  },
] as const;

export const events = [
  {
    id: 'e1',
    title: 'Community Tree Planting Drive',
    location: 'Accra Botanical Gardens',
    date: 'Aug 15',
    time: '9:00 AM',
    participants: 138,
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
    body: 'Great work! +100 XP for sorting plastics for recycling.',
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
