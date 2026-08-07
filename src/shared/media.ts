import type { ImageSourcePropType } from 'react-native';

/** Central image requires — paths are relative to this file (`src/shared`). */
export const images = {
  avatarIsaac: require('../../assets/avatar-isaac.png') as ImageSourcePropType,
  avatar1: require('../../assets/avatar-climate-1.png') as ImageSourcePropType,
  avatar2: require('../../assets/avatar-climate-2.png') as ImageSourcePropType,
  avatar3: require('../../assets/avatar-climate-3.png') as ImageSourcePropType,
  avatar4: require('../../assets/avatar-climate-4.png') as ImageSourcePropType,
  landingHero: require('../../assets/landing-hero.png') as ImageSourcePropType,
  onboardingLearn: require('../../assets/onboarding-learn.png') as ImageSourcePropType,
  onboardingAi: require('../../assets/onboarding-ai.png') as ImageSourcePropType,
  onboardingAction: require('../../assets/onboarding-action.png') as ImageSourcePropType,
  onboardingSplash: require('../../assets/onboarding-splash.png') as ImageSourcePropType,
};
