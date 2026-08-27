// src/config/sectionsConfig.js
export const homepageSections = [
  {
    id: 'collections',
    heading: 'Our Collection',
    subheading: 'Discover our complete range of premium fragrances, diffusers, and refills.',
    collectionId: 'all',
    viewAllLink: '/catalog', // Added leading slash
    image: 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/collection1.jpeg',
  }, 
  {
    id: 'scent-oil-diffusers',
    heading: 'Scent Oil Diffusers',
    subheading: 'Continuous, long-lasting aromas for your vehicle or home space.',
    collectionId: 'pcol_01KZX9K89HP4P59C4Y05WVR51N',
    viewAllLink: '/catalog?collection=pcol_01KZX9K89HP4P59C4Y05WVR51N',
    image: 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/scentdiffuser1.jpeg',
  },
  {
    id: 'air-fresheners',
    heading: 'Premium Air Fresheners',
    subheading: 'Elevate your daily drive with our aesthetic hanging scents.',
    collectionId: 'pcol_01M032DM5DFZCNJ8KYE5GXZJNT',
    viewAllLink: '/catalog?collection=pcol_01M032DM5DFZCNJ8KYE5GXZJNT',
    image: 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/airfreshner1.jpeg',
  },
  {
    id: 'bundles',
    heading: 'Exclusive Bundles',
    subheading: 'Save big when you purchase your favorite scent pairings together.',
    collectionId: 'pcol_01M0YMBXGFKKG2ZAC5Q7X4SVFP',
    viewAllLink: '/catalog?collection=pcol_01M0YMBXGFKKG2ZAC5Q7X4SVFP',
    image: 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/bundles1.jpeg',
  },
  {
    id: 'Balls',
    heading: 'DA BOSS CAN SOCK ME',
    subheading: 'Keep pests away with our naturally formulated protective diffusers.',
    collectionId: 'pcol_YOUR_ACTUAL_BALLS_MEDUSA_ID', // Replace with your real pcol_ ID
    viewAllLink: '/catalog?collection=pcol_YOUR_ACTUAL_BALLS_MEDUSA_ID',
    image: 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/web7.jpeg',
  },
  {
    id: 'refills',
    heading: 'Scent Refills',
    subheading: 'Keep your favorite diffusers full with our eco-friendly refill bottles.',
    collectionId: 'pcol_01M0HZF2DJFP50FNYMZ2DEBW85',
    viewAllLink: '/catalog?collection=pcol_01M0HZF2DJFP50FNYMZ2DEBW85',
    image: 'https://pub-f1b005fa8b8d40d390923f38752ae035.r2.dev/refill%20image.jpeg',
  },
]