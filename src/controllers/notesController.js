import {Note} from '../models/note.js';
import createHttpError from 'http-errors';

//GET /notes
export const getAllNotes = async (req, res) => {
  const { page, perPage, tag, search } = req.query;
  const skip = (page - 1) * perPage;

  const notesQuery = Note.find({ userId: req.user._id });

  if (search) {
    notesQuery.where({
      $text: { $search: search}
    });
  }
  if (tag) {
    notesQuery.where('tag').equals(tag);
  }

  const [totalItems, notes] = await Promise.all([
    notesQuery.clone().countDocuments(),
    notesQuery.skip(skip).limit(perPage),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);

  res.status(200).json({
    page: page,
    perPage: perPage,
    totalNotes: totalItems,
    totalPages: totalPages,
    notes: notes,
  });
};

//GET /notes/:noteId
export const getNoteById = async (req, res, next) => {
  const { noteId } = req.params;
  const note = await Note.findOne({
    _id: noteId,
    userId: req.user._id
  });

  if (!note) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(note);
};

//POST /notes - create a new note
export const createNote = async (req, res) => {
  const newNote = await Note.create({
    ...req.body,
    userId: req.user._id,
  });

  res.status(201).json(newNote);
};

//PATCH /notes/:noteId - update a note
export const updateNote = async (req, res, next) => {
  const { noteId } = req.params;
  const updateNote = await Note.findOneAndUpdate({
    _id: noteId,
    userId: req.user._id
  },
    req.body,
    { new: true });

  if (!updateNote) {
    next(createHttpError(404, 'Note not found'));
    return;
  }
  res.status(200).json(updateNote);
};

//DELETE /notes/:noteId
export const deleteNote = async (req, res, next) => {
  const { noteId } = req.params;
  const deleteNote = await Note.findOneAndDelete({
    _id: noteId,
    userId: req.user._id
  });

  if (!deleteNote) {
    next(createHttpError(404, 'Note not found'));
    return;
  }

  res.status(200).json(deleteNote);
};



