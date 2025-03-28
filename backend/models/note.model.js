import mongoose, { Mongoose } from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    require: true,
  },
  content: {
    type: String,
    require: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: String,
    require: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },

});

const Note = mongoose.model("Note", noteSchema);
export default Note;
