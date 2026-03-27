const mongoose = require('mongoose');

const contentTypes = ['news', 'calendar', 'map', 'gallery', 'discussions', 'recipes', 'archives'];

const contentItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: contentTypes,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180
    },
    subtitle: {
      type: String,
      trim: true,
      maxlength: 180
    },
    description: {
      type: String,
      trim: true,
      maxlength: 3000
    },
    imageUrl: {
      type: String,
      trim: true
    },
    eventDate: Date,
    location: {
      type: String,
      trim: true,
      maxlength: 160
    },
    host: {
      type: String,
      trim: true,
      maxlength: 120
    },
    tag: {
      type: String,
      trim: true,
      maxlength: 80
    },
    metric: {
      type: String,
      trim: true,
      maxlength: 80
    },
    period: {
      type: String,
      trim: true,
      maxlength: 80
    },
    displayOrder: {
      type: Number,
      default: 0
    },
    isPublished: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = {
  ContentItem: mongoose.model('ContentItem', contentItemSchema),
  contentTypes
};
