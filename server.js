require('dotenv').config();

const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const connectDB = require('./src/config/db');
const publicRoutes = require('./src/routes/publicRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 12
    }
  })
);

app.use((req, res, next) => {
  res.locals.isAdmin = Boolean(req.session.isAdmin);
  res.locals.siteName = process.env.SITE_NAME || 'The Living Scrapbook';
  res.locals.siteUrl = process.env.SITE_URL || `http://localhost:${PORT}`;
  const defaultOg = process.env.DEFAULT_OG_IMAGE || '/img/family-tree-og.svg';
  res.locals.defaultOgImage = defaultOg.startsWith('http') ? defaultOg : `${res.locals.siteUrl}${defaultOg}`;
  next();
});

app.use('/', publicRoutes);
app.use('/admin', adminRoutes);

app.use((error, req, res, next) => {
  // eslint-disable-next-line no-console
  console.error(error);

  if (error.name === 'MulterError' || error.message === 'Only image files are allowed.') {
    return res.status(400).send(`Upload error: ${error.message}`);
  }

  res.status(500).render('public/404', {
    seo: {
      title: `Server Error | ${res.locals.siteName}`,
      description: 'An unexpected error occurred while loading this page.',
      ogType: 'website',
      url: `${res.locals.siteUrl}${req.originalUrl}`
    }
  });
});

app.use((req, res) => {
  res.status(404).render('public/404', {
    seo: {
      title: `Page Not Found | ${res.locals.siteName}`,
      description: 'The page you requested could not be found.',
      ogType: 'website',
      url: `${res.locals.siteUrl}${req.originalUrl}`
    }
  });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
