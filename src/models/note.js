import { Schema, model } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const NoteSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
      trim: true,
    },
    tag: {
      type: String,
      enum: TAGS,
      default: "Todo",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

NoteSchema.index({
  title: 'text',
  content: 'text'
},
{
  default_language: 'english',
});

export const Note = model('Note', NoteSchema);


