import Note from "../models/note.model.js";
import { errorHandler } from "../utils/error.js";

export const addNote = async (req, res, next) => {
  const { title, content, tags } = req.body;
  const { id } = req.user;
  if (!title) {
    return next(errorHandler(400, "Tiêu đề là bắt buộc"));
  }
  if (!content) {
    return next(errorHandler(400, "Nội dung là bắt buộc"));
  }
  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: id,
    });
    await note.save();
    res.status(201).json({
      success: true,
      message: "Ghi chú đã được thêm thành công",
      note,
    });
  } catch (error) {
    next(error);
  }
};
export const editNote = async (req, res, next) => {
  const note = await Note.findById(req.params.noteId);

  if (!note) {
    return next(errorHandler(404, "Ghi chú không tìm thấy"));
  }

  if (req.user.id !== note.userId) {
    return next(errorHandler(401, "Bạn chỉ có thể cập nhật ghi chú của chính mình"));
  }

  const { title, content, tags, isPinned } = req.body;
  if (!title && !content && !tags) {
    return next(errorHandler(404, "Không có thay đổi nào được cung cấp"));
  }
  try {
    if (title) {
      note.title = title;
    }
    if (content) {
      note.content = content;
    }
    if (tags) {
      note.tags = tags;
    }
    if (isPinned) {
      note.isPinned = isPinned;
    }

    await note.save();
    res.status(200).json({
      success: true,
      message: "Cập nhật ghi chú thành cộng",
      note,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllNotes = async (req, res, next) => {
  const userId = req.user.id;
  try {
    const notes = await Note.find({ userId: userId }).sort({ isPinned: -1 });
    res.status(200).json({
      success: true,
      message: "Tất cả ghi chú đã được lấy thành công",
      notes,
    });
  } catch (error) {
    next(error);
  }
};
export const deleteNote = async (req, res, next) => {
  const noteId = req.params.noteId;
  const note = await Note.findOne({ _id: noteId, userId: req.user.id });
  if (!note) {
    return next(errorHandler(404, "Ghi chú không tìm thấy"));
  }
  try {
    await Note.deleteOne({ _id: noteId, userId: req.user.id });
    res.status(200).json({
      success: true,
      message: "Ghi chú đã được xóa thành công",
    });
  } catch (error) {
    next(error);
  }
};
export const updateNotePinned = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return next(errorHandler(404, "Ghi chú không tìm thấy"));
    }
    if (req.user.id !== note.userId) {
      return next(errorHandler(401, "Bạn chỉ có thể cập nhật ghi chú của mình"));
    }
    const { isPinned } = req.body;
    note.isPinned = isPinned;
    await note.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật ghi chú thành cộng",
      note,
    });
  } catch (error) {
    next(error);
  }
};
export const searchNote = async (req, res, next) => {
  const query = req.query.query;
  if (!query) {
    return next(errorHandler(400, "Truy vấn tìm kiếm là bắt buộc"));
  }
  try {
    const matchingNotes = await Note.find({
      userId: req.user.id,
      $or: [
        {
          title: { $regex: new RegExp(query, "i") },
        },
        {
          content: { $regex: new RegExp(query, "i") },
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: "Ghi chú khớp với truy vấn tìm kiếm đã được lấy thành công",
      notes: matchingNotes
    });
  } catch (error) {
    next(error);
  }
};
