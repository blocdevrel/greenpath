import { images } from '@/shared/media';

/** Climate youth avatars for GreenPath Ghana. */
export const onboardingAvatars = [
  { name: 'Ama', source: images.avatar1 },
  { name: 'Kwame', source: images.avatar2 },
  { name: 'Efua', source: images.avatar3 },
  { name: 'Yaw', source: images.avatar4 },
];

export const onboardingPages = [
  {
    id: 'learn',
    title: 'Learn About Climate Change',
    subtitle: 'Discover simple lessons that help you understand climate issues.',
    art: images.onboardingLearn,
  },
  {
    id: 'ai',
    title: 'Learn with AI',
    subtitle: 'Receive personalized quizzes and recommendations.',
    art: images.onboardingAi,
  },
  {
    id: 'action',
    title: 'Take Climate Action',
    subtitle: 'Complete daily climate missions and make a real impact.',
    art: images.onboardingSplash,
  },
] as const;

export const splashArt = images.landingHero;
export const profileAvatar = images.avatarIsaac;
