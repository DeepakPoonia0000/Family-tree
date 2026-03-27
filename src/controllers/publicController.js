const Member = require('../models/Member');
const { ContentItem } = require('../models/ContentItem');
const { buildSeo } = require('../utils/seo');

function groupByGeneration(members) {
  return members.reduce((acc, member) => {
    const key = member.generation;
    if (!acc[key]) acc[key] = [];
    acc[key].push(member);
    return acc;
  }, {});
}

function seoFor(res, path, title, description) {
  return buildSeo({
    siteName: res.locals.siteName,
    siteUrl: res.locals.siteUrl,
    defaultOgImage: res.locals.defaultOgImage,
    path,
    title: `${title} | ${res.locals.siteName}`,
    description
  });
}

async function fetchPublishedContent(type) {
  return ContentItem.find({ type, isPublished: true }).sort({ displayOrder: 1, eventDate: 1, createdAt: -1 }).lean();
}

function calendarStateFromRequest(items, req) {
  const now = new Date();
  const queryMonth = Number(req.query.month);
  const queryYear = Number(req.query.year);
  const month = Number.isFinite(queryMonth) && queryMonth >= 1 && queryMonth <= 12 ? queryMonth - 1 : now.getMonth();
  const year = Number.isFinite(queryYear) ? queryYear : now.getFullYear();
  const displayDate = new Date(year, month, 1);
  const currentYear = displayDate.getFullYear();
  const currentMonth = displayDate.getMonth();
  const monthName = displayDate.toLocaleString('default', { month: 'long' });
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i += 1) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) calendarDays.push(day);

  const calendarEvents = items
    .filter((item) => item.eventDate)
    .map((item) => ({ ...item, dateObj: new Date(item.eventDate) }))
    .filter((item) => item.dateObj.getMonth() === currentMonth && item.dateObj.getFullYear() === currentYear);

  const monthStart = new Date(currentYear, currentMonth, 1);
  const startAnchor = currentYear === now.getFullYear() && currentMonth === now.getMonth() ? now : monthStart;

  const upcomingThisMonth = calendarEvents
    .filter((item) => item.dateObj >= startAnchor)
    .sort((a, b) => a.dateObj - b.dateObj)
    .slice(0, 5);

  const eventTypes = ['Birthdays & Celebrations', 'School & Activities', 'Family Gatherings', 'Appointments'];
  const typeCounts = eventTypes.reduce((acc, type) => ({ ...acc, [type]: 0 }), {});

  calendarEvents.forEach((item) => {
    const label = inferEventType(item).label;
    typeCounts[label] = (typeCounts[label] || 0) + 1;
  });

  const allEvents = items
    .filter((item) => item.eventDate)
    .map((item) => ({ ...item, dateObj: new Date(item.eventDate) }))
    .sort((a, b) => b.dateObj - a.dateObj);
  const lastEvent = allEvents[0] || null;

  const prevDate = new Date(currentYear, currentMonth - 1, 1);
  const nextDate = new Date(currentYear, currentMonth + 1, 1);

  return {
    currentMonth,
    currentYear,
    monthName,
    calendarDays,
    calendarEvents,
    upcomingThisMonth,
    eventTypes,
    typeCounts,
    lastEvent,
    prevMonth: prevDate.getMonth() + 1,
    prevYear: prevDate.getFullYear(),
    nextMonth: nextDate.getMonth() + 1,
    nextYear: nextDate.getFullYear()
  };
}

function inferEventType(item) {
  const text = `${item.tag || ''} ${item.title || ''}`.toLowerCase();
  if (/birthday|celebration|party|anniversary/.test(text)) {
    return { label: 'Birthdays & Celebrations', color: 'bg-primary', badge: 'Celebration' };
  }
  if (/school|rehearsal|activity|hike|trip/.test(text)) {
    return { label: 'School & Activities', color: 'bg-secondary', badge: 'Activity' };
  }
  if (/dinner|gathering|family|reunion|festival/.test(text)) {
    return { label: 'Family Gatherings', color: 'bg-tertiary', badge: 'Gathering' };
  }
  if (/appointment|dentist|doctor|checkup/.test(text)) {
    return { label: 'Appointments', color: 'bg-error', badge: 'Appointment' };
  }
  return { label: 'Family Gatherings', color: 'bg-tertiary', badge: 'Gathering' };
}

async function home(req, res) {
  const members = await Member.find().sort({ generation: 1, birthDate: 1, fullName: 1 }).lean();
  const generationMap = groupByGeneration(members);
  const generations = Object.keys(generationMap)
    .map((n) => Number(n))
    .sort((a, b) => a - b);

  res.render('public/home', {
    members,
    generationMap,
    generations,
    seo: seoFor(
      res,
      '/',
      'Family Tree',
      `Explore ${res.locals.siteName} and follow each generation through stories, relationships, and milestones.`
    )
  });
}

async function dashboardPage(req, res) {
  const [newsItems, calendarItems, galleryItems, discussionItems] = await Promise.all([
    fetchPublishedContent('news'),
    fetchPublishedContent('calendar'),
    fetchPublishedContent('gallery'),
    fetchPublishedContent('discussions')
  ]);

  res.render('public/dashboard', {
    highlights: {
      news: newsItems.slice(0, 3),
      calendar: calendarItems.slice(0, 3),
      gallery: galleryItems.slice(0, 3),
      discussions: discussionItems.slice(0, 3)
    },
    seo: seoFor(res, '/dashboard', 'Home Dashboard', 'Central dashboard for your family tree, memories, and updates.')
  });
}

async function newsPage(req, res) {
  const newsItems = await fetchPublishedContent('news');

  res.render('public/news', {
    items: newsItems,
    seo: seoFor(res, '/news', 'News & Events', 'Family announcements and events feed.')
  });
}

async function calendarPage(req, res) {
  const calendarItems = await fetchPublishedContent('calendar');
  const items = calendarItems.map((item) => ({
    ...item,
    typeInfo: inferEventType(item)
  }));
  const calendarState = calendarStateFromRequest(items, req);

  res.render('public/calendar', {
    items,
    calendarState,
    seo: seoFor(res, '/calendar', 'Family Calendar', 'Upcoming family events and important dates.')
  });
}

async function mapPage(req, res) {
  const membersWithCoords = await Member.find({
    latitude: { $exists: true, $ne: null },
    longitude: { $exists: true, $ne: null }
  })
    .select('fullName relationship birthPlace latitude longitude photoUrl slug')
    .lean();

  res.render('public/map', {
    items: membersWithCoords,
    seo: seoFor(res, '/map', 'Family Map', 'Discover where your family roots and branches are located.')
  });
}

async function galleryPage(req, res) {
  const galleryItems = await fetchPublishedContent('gallery');

  res.render('public/gallery', {
    items: galleryItems,
    seo: seoFor(res, '/gallery', 'Achievements Gallery', 'Celebrate achievements and milestones across generations.')
  });
}

async function discussionsPage(req, res) {
  const discussionItems = await fetchPublishedContent('discussions');

  res.render('public/discussions', {
    items: discussionItems,
    seo: seoFor(res, '/discussions', 'Discussion Boards', 'Family discussion boards for stories and planning.')
  });
}

async function recipesPage(req, res) {
  const recipeItems = await fetchPublishedContent('recipes');

  res.render('public/recipes', {
    items: recipeItems,
    seo: seoFor(res, '/recipes', 'Family Recipes', 'A preserved collection of family recipes and traditions.')
  });
}

async function archivesPage(req, res) {
  const archiveItems = await fetchPublishedContent('archives');

  res.render('public/archives', {
    items: archiveItems,
    seo: seoFor(res, '/archives', 'Digital Archives', 'Family letters, records, and documents archived digitally.')
  });
}

async function memberProfile(req, res) {
  const member = await Member.findOne({ slug: req.params.slug })
    .populate('parentIds', 'fullName slug')
    .populate('spouseId', 'fullName slug')
    .lean();

  if (!member) {
    return res.status(404).render('public/404', {
      seo: buildSeo({
        siteName: res.locals.siteName,
        siteUrl: res.locals.siteUrl,
        defaultOgImage: res.locals.defaultOgImage,
        path: req.originalUrl,
        title: `Member Not Found | ${res.locals.siteName}`,
        description: 'This family member profile could not be found.'
      })
    });
  }

  const children = await Member.find({ parentIds: member._id }).select('fullName slug').sort({ birthDate: 1, fullName: 1 }).lean();

  return res.render('members/profile', {
    member,
    children,
    seo: buildSeo({
      siteName: res.locals.siteName,
      siteUrl: res.locals.siteUrl,
      defaultOgImage: res.locals.defaultOgImage,
      path: req.originalUrl,
      title: `${member.fullName} | ${res.locals.siteName}`,
      description: member.bio?.slice(0, 155) || `Read the life story and family connections of ${member.fullName}.`,
      ogType: 'profile',
      ogImage: member.photoUrl
    })
  });
}

module.exports = {
  home,
  memberProfile,
  dashboardPage,
  newsPage,
  calendarPage,
  mapPage,
  galleryPage,
  discussionsPage,
  recipesPage,
  archivesPage
};
