require('dotenv').config();

const mongoose = require('mongoose');
const Member = require('../src/models/Member');
const { ContentItem } = require('../src/models/ContentItem');

const seedMembers = [
  {
    fullName: 'Arthur Henderson',
    relationship: 'Grandfather',
    generation: 1,
    birthDate: new Date('1924-03-08'),
    deathDate: new Date('2012-08-18'),
    birthPlace: 'Savannah, Georgia',
    bio: 'Arthur was the anchor of the Henderson family and preserved many oral stories for future generations.',
    isFeatured: true,
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
  },
  {
    fullName: 'Eleanor Henderson',
    relationship: 'Grandmother',
    generation: 1,
    birthDate: new Date('1928-11-14'),
    deathDate: new Date('2019-02-06'),
    birthPlace: 'Nashville, Tennessee',
    bio: 'Eleanor archived family letters and photo albums, becoming the memory-keeper of the household.',
    isFeatured: true,
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80'
  },
  {
    fullName: 'Robert Henderson',
    relationship: 'Son',
    generation: 2,
    birthDate: new Date('1952-06-30'),
    birthPlace: 'Atlanta, Georgia',
    bio: 'Robert introduced digital archiving to keep family records searchable and safe.',
    photoUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=600&q=80'
  },
  {
    fullName: 'Martha Henderson',
    relationship: 'Daughter',
    generation: 2,
    birthDate: new Date('1958-01-11'),
    birthPlace: 'Atlanta, Georgia',
    bio: 'Martha organized annual family reunions and documented milestone events.',
    photoUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=600&q=80'
  }
];

const seedContent = [
  {
    type: 'news',
    title: 'Spring Reunion Confirmed',
    tag: 'Announcement',
    description: 'Our annual reunion is confirmed with family activities and story-sharing sessions.',
    displayOrder: 1
  },
  {
    type: 'calendar',
    title: 'Family Reunion Brunch',
    eventDate: new Date('2026-04-18'),
    location: 'Riverside Hall',
    host: 'Martha H.',
    displayOrder: 1
  },
  {
    type: 'map',
    title: 'Founding Region',
    location: 'Savannah, GA',
    description: 'Origin point of the earliest documented Henderson branch.',
    displayOrder: 1
  },
  {
    type: 'gallery',
    title: 'Heritage Preservation Award',
    tag: 'Achievement',
    description: 'Awarded for preserving family records and oral stories.',
    displayOrder: 1
  },
  {
    type: 'discussions',
    title: 'Reunion Planning 2026',
    metric: '18 replies',
    description: 'Collaborative thread for planning logistics and schedule.',
    displayOrder: 1
  },
  {
    type: 'recipes',
    title: "Grandma Eleanor's Pie",
    tag: 'Dessert',
    description: 'A classic pie recipe passed down through generations.',
    displayOrder: 1
  },
  {
    type: 'archives',
    title: 'Old Letters Collection',
    period: '1930-1955',
    description: 'Digitized letters documenting family life through key decades.',
    displayOrder: 1
  }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Member.deleteMany({});
    await ContentItem.deleteMany({});

    const inserted = await Member.insertMany(seedMembers);

    const [arthur, eleanor, robert, martha] = inserted;

    robert.parentIds = [arthur._id, eleanor._id];
    martha.parentIds = [arthur._id, eleanor._id];
    arthur.spouseId = eleanor._id;
    eleanor.spouseId = arthur._id;

    await Promise.all([robert.save(), martha.save(), arthur.save(), eleanor.save()]);
    await ContentItem.insertMany(seedContent);

    // eslint-disable-next-line no-console
    console.log('Seed complete. Members inserted:', inserted.length, 'Content items inserted:', seedContent.length);
    process.exit(0);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

run();
