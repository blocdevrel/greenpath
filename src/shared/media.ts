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
  /** Fox mascot — first-load splash / welcome. */
  mascotWelcome: require('../../assets/images/mascot-welcome.png') as ImageSourcePropType,
  /** Fox peeking — sign-in / sign-up accent. */
  mascotAuth: require('../../assets/images/mascot-auth.png') as ImageSourcePropType,
  /** Flame on grass — daily streak. */
  streakFire: require('../../assets/images/streak-fire.png') as ImageSourcePropType,
  /** Treasure chest — rewards / badges. */
  treasure: require('../../assets/images/treasure.png') as ImageSourcePropType,
  /** Earth — climate impact. */
  earth: require('../../assets/images/earth.png') as ImageSourcePropType,
  mascotLogo: require('../../assets/images/moscot-logo.png') as ImageSourcePropType,
  eventUgLegon: require('../../assets/events/ug-legon-cleanup.jpg') as ImageSourcePropType,
  eventKnust: require('../../assets/events/knust-cleanup.jpg') as ImageSourcePropType,
  eventUgBotanical: require('../../assets/events/ug-botanical.jpg') as ImageSourcePropType,
  eventUgHall: require('../../assets/events/ug-great-hall.jpg') as ImageSourcePropType,
  instructorAma: require('../../assets/instructors/instructor-ama.png') as ImageSourcePropType,
  instructorKwame: require('../../assets/instructors/instructor-kwame.png') as ImageSourcePropType,
  instructorEfua: require('../../assets/instructors/instructor-efua.png') as ImageSourcePropType,
  instructorYaw: require('../../assets/instructors/instructor-yaw.png') as ImageSourcePropType,
  instructorAbena: require('../../assets/instructors/instructor-abena.png') as ImageSourcePropType,
  instructorKofi: require('../../assets/instructors/instructor-kofi.png') as ImageSourcePropType,
  lessonClimate: require('../../assets/lessons/climate-accra.jpg') as ImageSourcePropType,
  lessonWaste: require('../../assets/lessons/waste-agbogbloshie.jpg') as ImageSourcePropType,
  lessonSolar: require('../../assets/lessons/solar-panels.jpg') as ImageSourcePropType,
  lessonPlastic: require('../../assets/lessons/plastic-accra-beach.jpg') as ImageSourcePropType,
  lessonWater: require('../../assets/lessons/water-ghana.jpg') as ImageSourcePropType,
  lessonAgri: require('../../assets/lessons/cocoa-ghana.jpg') as ImageSourcePropType,
  illustMissionAction: require('../../assets/illustrations/mission-action.jpg') as ImageSourcePropType,
  illustMissionRecycle: require('../../assets/illustrations/mission-recycle.jpg') as ImageSourcePropType,
  illustEventCleanup: require('../../assets/illustrations/event-cleanup.jpg') as ImageSourcePropType,
  illustEventPlanting: require('../../assets/illustrations/event-planting.jpg') as ImageSourcePropType,
  illustEventCommunity: require('../../assets/illustrations/event-community.jpg') as ImageSourcePropType,
};
