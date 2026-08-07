import type {
  DangerSignItem,
  FacilityOption,
  FacilitySector,
  HouseholdDetail,
  TreatProtocol,
  VisitCohort,
} from '../types';

export const householdsById: Record<string, HouseholdDetail> = {
  'amina-yakubu': {
    id: 'amina-yakubu',
    name: 'Amina Yakubu',
    patientType: 'Pregnant · 32 weeks',
    reason: 'Anaemia symptoms noted at the last visit.',
    level: 'refer',
    distance: '2.4 km',
    dueLabel: '6 days overdue',
    landmark: 'Near Kumbungu market borehole',
    caregiver: 'Husband · Ibrahim Yakubu',
    members: [
      { name: 'Amina Yakubu', role: 'Pregnant · 32 weeks' },
      { name: 'Ibrahim Yakubu', role: 'Household head' },
      { name: 'Rashida Yakubu', role: 'Child · 4 years' },
    ],
    openFlags: ['Prior pallor', 'Iron/folate follow-up', 'ANC overdue'],
    suggestedCohort: 'pregnancy',
  },
  'baby-musah': {
    id: 'baby-musah',
    name: 'Baby Musah',
    patientType: 'Newborn · 11 days',
    reason: 'Newborn check overdue; fast breathing reported.',
    level: 'refer',
    distance: '3.1 km',
    dueLabel: 'Due today',
    landmark: 'Behind Tolon mosque',
    caregiver: 'Mother · Mariama Musah',
    members: [
      { name: 'Baby Musah', role: 'Newborn · 11 days' },
      { name: 'Mariama Musah', role: 'Postpartum mother' },
      { name: 'Abdul Musah', role: 'Household head' },
    ],
    openFlags: ['PNC day 7–14 overdue', 'Breathing concern'],
    suggestedCohort: 'newborn',
  },
  'fatima-adam': {
    id: 'fatima-adam',
    name: 'Fatima Adam',
    patientType: 'Child · 14 months',
    reason: 'Low weight-for-age; feeding support started.',
    level: 'treat',
    distance: '1.2 km',
    dueLabel: 'Visit by 2:00 PM',
    landmark: 'Savelugu junction path',
    caregiver: 'Mother · Hajia Adam',
    members: [
      { name: 'Fatima Adam', role: 'Child · 14 months' },
      { name: 'Hajia Adam', role: 'Primary caregiver' },
    ],
    openFlags: ['Nutrition follow-up', 'Growth monitoring'],
    suggestedCohort: 'child',
  },
  'hauwa-ibrahim': {
    id: 'hauwa-ibrahim',
    name: 'Hauwa Ibrahim',
    patientType: 'Pregnant · 28 weeks',
    reason: 'High blood pressure flagged at CHPS.',
    level: 'refer',
    distance: '4.0 km',
    dueLabel: 'Print slip',
    landmark: 'Near CHPS compound road',
    caregiver: 'Sister · Aisha Ibrahim',
    members: [
      { name: 'Hauwa Ibrahim', role: 'Pregnant · 28 weeks' },
      { name: 'Aisha Ibrahim', role: 'Companion' },
    ],
    openFlags: ['Elevated BP', 'Referral slip pending'],
    suggestedCohort: 'pregnancy',
  },
};

export const cohorts: {
  id: VisitCohort;
  title: string;
  detail: string;
}[] = [
  { id: 'pregnancy', title: 'Pregnant woman', detail: 'ANC · danger signs · anaemia' },
  { id: 'postpartum', title: 'Postpartum mother', detail: 'Bleeding · sepsis · recovery' },
  { id: 'newborn', title: 'Newborn (0–28 days)', detail: 'Feeding · breathing · warmth' },
  { id: 'child', title: 'Child under 5', detail: 'Malaria · diarrhoea · pneumonia' },
];

export const dangerSignsByCohort: Record<VisitCohort, DangerSignItem[]> = {
  pregnancy: [
    { id: 'bleeding', prompt: 'Any vaginal bleeding?', lookHint: 'Ask amount and onset' },
    {
      id: 'headache',
      prompt: 'Severe headache, blurred vision, or upper belly pain?',
    },
    { id: 'fits', prompt: 'Fits, convulsions, or loss of consciousness?' },
    { id: 'fever', prompt: 'Fever or chills?' },
    { id: 'abdomen', prompt: 'Severe abdominal pain?' },
    { id: 'fetal', prompt: 'Baby movements reduced or stopped? (if >20 weeks)' },
    {
      id: 'anaemia',
      prompt: 'Breathless at rest, dizzy, or severe pallor?',
      lookHint: 'Check conjunctiva, tongue, palms, nails',
    },
    { id: 'swelling', prompt: 'Swelling of face or hands?' },
  ],
  postpartum: [
    { id: 'pph', prompt: 'Heavy bleeding, soaking cloths, or large clots?' },
    { id: 'fever', prompt: 'Fever with foul discharge or lower belly pain?' },
    { id: 'headache', prompt: 'Severe headache, blurred vision, or fits?' },
    { id: 'collapse', prompt: 'Dizzy, collapsed, or cold and clammy?' },
    { id: 'wound', prompt: 'Severe wound pain, gaping, or pus?' },
    { id: 'care', prompt: 'Unable to care for herself or the baby?' },
  ],
  newborn: [
    { id: 'feeding', prompt: 'Not feeding, stopped feeding, or vomiting everything?' },
    { id: 'fits', prompt: 'Convulsions or fits?' },
    {
      id: 'breathing',
      prompt: 'Fast breathing or chest pulling in?',
      lookHint: 'Count breaths; look for in-drawing',
    },
    { id: 'temp', prompt: 'Fever or baby feels cold to touch?' },
    { id: 'jaundice', prompt: 'Yellow palms, soles, or deep jaundice?' },
    { id: 'activity', prompt: 'Lethargic, floppy, or not moving spontaneously?' },
    { id: 'cord', prompt: 'Redness, pus, or foul smell around the cord?' },
    {
      id: 'asphyxia',
      prompt: 'Still distressed after difficult birth (poor cry, blue, floppy)?',
    },
  ],
  child: [
    { id: 'drink', prompt: 'Unable to drink or breastfeed?' },
    { id: 'vomit', prompt: 'Vomits everything?' },
    { id: 'fits', prompt: 'Convulsions now or during this illness?' },
    { id: 'lethargy', prompt: 'Lethargic or unconscious?' },
    { id: 'indrawing', prompt: 'Chest in-drawing or very fast breathing?' },
    { id: 'blood_stool', prompt: 'Blood in stool or not improving on ORS?' },
    { id: 'pallor', prompt: 'Severe pallor or stiff neck with fever?' },
    { id: 'oedema', prompt: 'Swelling of both feet or severe wasting?' },
  ],
};

export const facilities: FacilityOption[] = [
  {
    id: 'kumbungu-chps',
    name: 'Kumbungu CHPS',
    sector: 'chps',
    level: 'CHPS',
    distance: '4 km',
    distanceKm: 4,
    services: ['CHO', 'BP', 'First aid'],
    routeNote: 'Nearest compound',
    capacity: 'yes',
    canHandle: ['pregnancy', 'postpartum', 'child'],
  },
  {
    id: 'savelugu-chps',
    name: 'Savelugu CHPS',
    sector: 'chps',
    level: 'CHPS',
    distance: '2 km',
    distanceKm: 2,
    services: ['CHO', 'ANC desk'],
    routeNote: 'Passable',
    capacity: 'yes',
    canHandle: ['pregnancy', 'postpartum', 'child'],
  },
  {
    id: 'tolon-hc',
    name: 'Tolon Health Centre',
    sector: 'health_centre',
    level: 'Health centre',
    distance: '6 km',
    distanceKm: 6,
    services: ['Midwife', 'ANC', 'PNC', 'Lab'],
    routeNote: 'Market road open',
    capacity: 'limited',
    canHandle: ['pregnancy', 'postpartum', 'newborn', 'child'],
  },
  {
    id: 'kumbungu-hc',
    name: 'Kumbungu Health Centre',
    sector: 'health_centre',
    level: 'Health centre',
    distance: '5 km',
    distanceKm: 5,
    services: ['Midwife', 'Lab', 'Malaria'],
    routeNote: 'Short track',
    capacity: 'yes',
    canHandle: ['pregnancy', 'postpartum', 'newborn', 'child'],
  },
  {
    id: 'savelugu-hospital',
    name: 'Savelugu Hospital',
    sector: 'hospital',
    level: 'District · EmONC',
    distance: '11 km',
    distanceKm: 11,
    services: ['EmONC', 'Lab', 'Blood', 'Newborn'],
    routeNote: 'Use Tamale bypass (flood)',
    capacity: 'yes',
    canHandle: ['pregnancy', 'postpartum', 'newborn', 'child'],
    suggested: true,
  },
  {
    id: 'gushegu-hospital',
    name: 'Gushegu Hospital',
    sector: 'hospital',
    level: 'District hospital',
    distance: '22 km',
    distanceKm: 22,
    services: ['EmONC', 'Lab', 'Theatre'],
    routeNote: 'Longer dry-season route',
    capacity: 'unknown',
    canHandle: ['pregnancy', 'postpartum', 'newborn', 'child'],
  },
  {
    id: 'tamale-teaching',
    name: 'Tamale Teaching Hospital',
    sector: 'teaching',
    level: 'Regional / Teaching',
    distance: '18 km',
    distanceKm: 18,
    services: ['ICU', 'Blood bank', 'Surgery', 'NICU'],
    routeNote: 'Step-up for severe cases',
    capacity: 'limited',
    canHandle: ['pregnancy', 'postpartum', 'newborn', 'child'],
  },
  {
    id: 'tamale-central',
    name: 'Tamale Central Hospital',
    sector: 'hospital',
    level: 'Municipal hospital',
    distance: '16 km',
    distanceKm: 16,
    services: ['Lab', 'Blood', 'Maternity'],
    routeNote: 'City traffic delay',
    capacity: 'no',
    canHandle: ['pregnancy', 'postpartum', 'newborn', 'child'],
  },
  {
    id: 'savelugu-nutrition',
    name: 'Savelugu Nutrition Unit',
    sector: 'nutrition',
    level: 'Nutrition',
    distance: '10 km',
    distanceKm: 10,
    services: ['CMAM', 'Counselling'],
    routeNote: 'For severe wasting follow-up',
    capacity: 'yes',
    canHandle: ['child'],
  },
  {
    id: 'polyclinic-tamale',
    name: 'Tamale Polyclinic',
    sector: 'other',
    level: 'Polyclinic',
    distance: '15 km',
    distanceKm: 15,
    services: ['OPD', 'Lab', 'ANC'],
    routeNote: 'Daytime only',
    capacity: 'yes',
    canHandle: ['pregnancy', 'postpartum', 'child'],
  },
];

export const facilitySectorFilters: { id: FacilitySector | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'chps', label: 'CHPS' },
  { id: 'health_centre', label: 'Health centre' },
  { id: 'hospital', label: 'Hospital' },
  { id: 'teaching', label: 'Teaching' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'other', label: 'Other' },
];

export const treatProtocols: TreatProtocol[] = [
  {
    id: 'mild-anaemia',
    title: 'Mild anaemia counselling',
    cohort: 'pregnancy',
    steps: [
      'No breathlessness at rest / severe pallor',
      'Iron-rich foods + iron/folate',
      'ITN · next ANC date',
      'Return in 3 days if worse',
    ],
    drugs: ['Iron/folate', 'ITN'],
  },
  {
    id: 'ors-zinc',
    title: 'Diarrhoea — ORS + zinc',
    cohort: 'child',
    steps: [
      'No blood in stool; child can drink',
      'ORS + show caregiver',
      'Zinc full course',
      'Follow up tomorrow',
    ],
    drugs: ['ORS', 'Zinc'],
  },
  {
    id: 'uncomplicated-malaria',
    title: 'Uncomplicated malaria',
    cohort: 'child',
    steps: [
      'RDT if available',
      'ACT full course',
      'ITN · danger signs',
      'Follow up 48h',
    ],
    drugs: ['mRDT', 'ACT'],
  },
  {
    id: 'enc-support',
    title: 'Newborn care (well baby)',
    cohort: 'newborn',
    steps: [
      'Feeding · warm · cord clean',
      'Exclusive breastfeeding',
      'Teach danger signs',
      'Next PNC visit',
    ],
    drugs: [],
  },
  {
    id: 'nutrition',
    title: 'Feeding / nutrition support',
    cohort: 'child',
    steps: [
      'Feeding frequency & diversity',
      'Age-right complementary foods',
      'Flag food stress',
      'Growth monitoring return',
    ],
    drugs: [],
  },
];

export function protocolForCohort(cohort: VisitCohort): TreatProtocol {
  if (cohort === 'pregnancy') return treatProtocols[0];
  if (cohort === 'newborn') return treatProtocols[3];
  if (cohort === 'child') return treatProtocols[4];
  return treatProtocols[0];
}

/** Full directory for the zone; capable sites sort first, then distance. */
export function facilitiesForCohort(cohort: VisitCohort): FacilityOption[] {
  return [...facilities].sort((a, b) => {
    const aOk = a.canHandle.includes(cohort) ? 0 : 1;
    const bOk = b.canHandle.includes(cohort) ? 0 : 1;
    if (aOk !== bOk) return aOk - bOk;
    if (!!a.suggested !== !!b.suggested) return a.suggested ? -1 : 1;
    return a.distanceKm - b.distanceKm;
  });
}

export function suggestedFacilityId(cohort: VisitCohort): string | null {
  const list = facilitiesForCohort(cohort);
  return list.find((f) => f.canHandle.includes(cohort) && f.capacity !== 'no')?.id ?? list[0]?.id ?? null;
}
