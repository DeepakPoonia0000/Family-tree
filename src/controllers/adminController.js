const mongoose = require('mongoose');
const Member = require('../models/Member');
const { ContentItem, contentTypes } = require('../models/ContentItem');
const { buildSeo } = require('../utils/seo');

const CONTENT_TYPE_META = {
  news: { label: 'News Feed', description: 'Announcements and family updates.' },
  calendar: { label: 'Family Calendar', description: 'Events and important dates.' },
  map: { label: 'Family Map', description: 'Locations and lineage geography.' },
  gallery: { label: 'Achievements Gallery', description: 'Photos, milestones, and highlights.' },
  discussions: { label: 'Discussion Boards', description: 'Conversation topics and threads.' },
  recipes: { label: 'Family Recipes', description: 'Dishes and kitchen memories.' },
  archives: { label: 'Digital Archives', description: 'Historical records and documents.' }
};

function sanitizeIdArray(value) {
  if (!value) return [];
  const list = Array.isArray(value) ? value : [value];
  return list.filter((id) => mongoose.Types.ObjectId.isValid(id));
}

function normalizeDate(value) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeNumber(value) {
  if (value === undefined || value === null || value === '') return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function getContentTypeMeta(type) {
  const meta = CONTENT_TYPE_META[type];
  if (!meta) return null;

  return {
    type,
    ...meta,
    routeBase: `/admin/content/${type}`
  };
}

function toPublicUploadPath(file) {
  if (!file) return null;
  return `/uploads/${file.filename}`;
}

function normalizeContentPayload(body, type, imagePath) {
  return {
    type,
    title: body.title?.trim(),
    subtitle: body.subtitle?.trim(),
    description: body.description?.trim(),
    imageUrl: imagePath || body.imageUrl?.trim(),
    eventDate: normalizeDate(body.eventDate),
    location: body.location?.trim(),
    host: body.host?.trim(),
    tag: body.tag?.trim(),
    metric: body.metric?.trim(),
    period: body.period?.trim(),
    displayOrder: Number(body.displayOrder) || 0,
    isPublished: body.isPublished === 'on'
  };
}

function splitMultilineText(value) {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseMilestones(value) {
  return splitMultilineText(value).map((line) => {
    const parts = line.split('|').map((part) => part.trim());
    return {
      year: Number(parts[0]) || undefined,
      title: parts[1] || '',
      description: parts[2] || ''
    };
  }).filter((milestone) => milestone.title || milestone.description);
}

function memberPayload(body, memberId, photoPath) {
  const payload = {
    fullName: body.fullName?.trim(),
    relationship: body.relationship?.trim(),
    generation: Number(body.generation) || 1,
    birthDate: normalizeDate(body.birthDate),
    deathDate: normalizeDate(body.deathDate),
    birthPlace: body.birthPlace?.trim(),
    latitude: normalizeNumber(body.latitude),
    longitude: normalizeNumber(body.longitude),
    bio: body.bio?.trim(),
    photoUrl: photoPath || body.photoUrl?.trim() || '/img/default-avatar.svg',
    favoriteMemory: body.favoriteMemory?.trim(),
    affiliations: splitMultilineText(body.affiliations),
    milestones: parseMilestones(body.milestones),
    galleryImageUrls: splitMultilineText(body.galleryImageUrls),
    isFeatured: body.isFeatured === 'on',
    parentIds: sanitizeIdArray(body.parentIds),
    spouseId: mongoose.Types.ObjectId.isValid(body.spouseId) ? body.spouseId : undefined
  };

  if (memberId) {
    payload.parentIds = payload.parentIds.filter((id) => String(id) !== String(memberId));
    if (payload.spouseId && String(payload.spouseId) === String(memberId)) {
      payload.spouseId = undefined;
    }
  }

  return payload;
}

function loginSeo(res) {
  return buildSeo({
    siteName: res.locals.siteName,
    siteUrl: res.locals.siteUrl,
    defaultOgImage: res.locals.defaultOgImage,
    path: '/admin/login',
    title: `Admin Login | ${res.locals.siteName}`,
    description: `Secure single-admin login for managing ${res.locals.siteName} family records.`,
    robots: 'noindex,nofollow'
  });
}

function adminSeo(res, req, title, description) {
  return buildSeo({
    siteName: res.locals.siteName,
    siteUrl: res.locals.siteUrl,
    defaultOgImage: res.locals.defaultOgImage,
    path: req.originalUrl,
    title,
    description,
    robots: 'noindex,nofollow'
  });
}

async function getLogin(req, res) {
  if (req.session.isAdmin) {
    return res.redirect('/admin');
  }

  return res.render('admin/login', {
    error: null,
    seo: loginSeo(res)
  });
}

async function postLogin(req, res) {
  const username = req.body.username?.trim();
  const password = req.body.password;

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return res.status(500).render('admin/login', {
      error: 'Admin credentials are not configured. Add ADMIN_USERNAME and ADMIN_PASSWORD in your .env file.',
      seo: loginSeo(res)
    });
  }

  if (username !== expectedUser || password !== expectedPass) {
    return res.status(401).render('admin/login', {
      error: 'Invalid login credentials.',
      seo: loginSeo(res)
    });
  }

  req.session.isAdmin = true;
  return res.redirect('/admin');
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
}

async function dashboard(req, res) {
  const [members, contentCounts] = await Promise.all([
    Member.find().sort({ generation: 1, fullName: 1 }).lean(),
    ContentItem.aggregate([{ $group: { _id: '$type', total: { $sum: 1 } } }])
  ]);

  const countsMap = contentCounts.reduce((acc, item) => {
    acc[item._id] = item.total;
    return acc;
  }, {});

  const contentModules = contentTypes.map((type) => {
    const meta = getContentTypeMeta(type);
    return {
      ...meta,
      count: countsMap[type] || 0
    };
  });

  return res.render('admin/dashboard', {
    members,
    contentModules,
    seo: adminSeo(
      res,
      req,
      `Admin Dashboard | ${res.locals.siteName}`,
      'Manage family members, pages, and all dynamic content modules.'
    )
  });
}

async function getNewMember(req, res) {
  const members = await Member.find().sort({ generation: 1, fullName: 1 }).lean();

  return res.render('admin/member-form', {
    formTitle: 'Add New Member',
    action: '/admin/members',
    member: {},
    members,
    seo: adminSeo(
      res,
      req,
      `Add Member | ${res.locals.siteName}`,
      'Add a new family member and their profile details to the tree.'
    )
  });
}

async function createMember(req, res) {
  const photoPath = toPublicUploadPath(req.file);
  await Member.create(memberPayload(req.body, null, photoPath));
  return res.redirect('/admin');
}

async function getEditMember(req, res) {
  const member = await Member.findById(req.params.id).lean();

  if (!member) {
    return res.redirect('/admin');
  }

  const members = await Member.find({ _id: { $ne: req.params.id } }).sort({ generation: 1, fullName: 1 }).lean();

  return res.render('admin/member-form', {
    formTitle: 'Edit Member',
    action: `/admin/members/${member._id}`,
    member,
    members,
    seo: adminSeo(
      res,
      req,
      `Edit ${member.fullName} | ${res.locals.siteName}`,
      `Update profile and relationship details for ${member.fullName}.`
    )
  });
}

async function updateMember(req, res) {
  const photoPath = toPublicUploadPath(req.file);
  await Member.findByIdAndUpdate(req.params.id, memberPayload(req.body, req.params.id, photoPath), {
    runValidators: true,
    new: true
  });

  return res.redirect('/admin');
}

async function deleteMember(req, res) {
  const memberId = req.params.id;
  await Member.findByIdAndDelete(memberId);

  await Member.updateMany({ parentIds: memberId }, { $pull: { parentIds: memberId } });
  await Member.updateMany({ spouseId: memberId }, { $unset: { spouseId: 1 } });

  return res.redirect('/admin');
}

async function contentList(req, res) {
  const typeMeta = getContentTypeMeta(req.params.type);
  if (!typeMeta) return res.redirect('/admin');

  const items = await ContentItem.find({ type: typeMeta.type }).sort({ displayOrder: 1, createdAt: -1 }).lean();

  return res.render('admin/content-list', {
    typeMeta,
    items,
    seo: adminSeo(
      res,
      req,
      `${typeMeta.label} | Admin | ${res.locals.siteName}`,
      `Manage ${typeMeta.label.toLowerCase()} content entries.`
    )
  });
}

async function getNewContent(req, res) {
  const typeMeta = getContentTypeMeta(req.params.type);
  if (!typeMeta) return res.redirect('/admin');

  return res.render('admin/content-form', {
    formTitle: `Add ${typeMeta.label} Item`,
    action: `${typeMeta.routeBase}`,
    typeMeta,
    item: {},
    seo: adminSeo(
      res,
      req,
      `Add ${typeMeta.label} | ${res.locals.siteName}`,
      `Create a new item for ${typeMeta.label.toLowerCase()}.`
    )
  });
}

async function createContent(req, res) {
  const typeMeta = getContentTypeMeta(req.params.type);
  if (!typeMeta) return res.redirect('/admin');

  const imagePath = toPublicUploadPath(req.file);
  await ContentItem.create(normalizeContentPayload(req.body, typeMeta.type, imagePath));
  return res.redirect(typeMeta.routeBase);
}

async function getEditContent(req, res) {
  const typeMeta = getContentTypeMeta(req.params.type);
  if (!typeMeta) return res.redirect('/admin');

  const item = await ContentItem.findOne({ _id: req.params.id, type: typeMeta.type }).lean();
  if (!item) return res.redirect(typeMeta.routeBase);

  return res.render('admin/content-form', {
    formTitle: `Edit ${typeMeta.label} Item`,
    action: `${typeMeta.routeBase}/${item._id}`,
    typeMeta,
    item,
    seo: adminSeo(
      res,
      req,
      `Edit ${typeMeta.label} | ${res.locals.siteName}`,
      `Update this ${typeMeta.label.toLowerCase()} entry.`
    )
  });
}

async function updateContent(req, res) {
  const typeMeta = getContentTypeMeta(req.params.type);
  if (!typeMeta) return res.redirect('/admin');

  const imagePath = toPublicUploadPath(req.file);
  await ContentItem.findOneAndUpdate(
    { _id: req.params.id, type: typeMeta.type },
    normalizeContentPayload(req.body, typeMeta.type, imagePath),
    { runValidators: true }
  );

  return res.redirect(typeMeta.routeBase);
}

async function deleteContent(req, res) {
  const typeMeta = getContentTypeMeta(req.params.type);
  if (!typeMeta) return res.redirect('/admin');

  await ContentItem.findOneAndDelete({ _id: req.params.id, type: typeMeta.type });
  return res.redirect(typeMeta.routeBase);
}

module.exports = {
  getLogin,
  postLogin,
  logout,
  dashboard,
  getNewMember,
  createMember,
  getEditMember,
  updateMember,
  deleteMember,
  contentList,
  getNewContent,
  createContent,
  getEditContent,
  updateContent,
  deleteContent
};
