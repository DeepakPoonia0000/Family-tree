const mongoose = require('mongoose');
const slugify = require('slugify');

const memberSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    slug: {
      type: String,
      unique: true,
      index: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60
    },
    generation: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 1
    },
    birthDate: Date,
    deathDate: Date,
    birthPlace: {
      type: String,
      trim: true,
      maxlength: 120
    },
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 3000
    },
    photoUrl: {
      type: String,
      trim: true,
      default: '/img/default-avatar.svg'
    },
    favoriteMemory: {
      type: String,
      trim: true,
      maxlength: 500
    },
    affiliations: [
      {
        type: String,
        trim: true,
        maxlength: 150
      }
    ],
    milestones: [
      {
        year: Number,
        title: { type: String, trim: true, maxlength: 120 },
        description: { type: String, trim: true, maxlength: 500 }
      }
    ],
    galleryImageUrls: [
      {
        type: String,
        trim: true
      }
    ],
    parentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member'
      }
    ],
    spouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    isFeatured: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

memberSchema.pre('validate', async function setSlug(next) {
  if (!this.fullName) {
    return next();
  }

  const baseSlug = slugify(this.fullName, { lower: true, strict: true });

  if (this.slug && this.slug.startsWith(baseSlug)) {
    return next();
  }

  let slug = baseSlug;
  let count = 1;
  while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
    count += 1;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
  return next();
});

module.exports = mongoose.model('Member', memberSchema);
