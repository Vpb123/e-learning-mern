import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  questions: [
    {
      questionText: { type: String, required: true },
      options: [
        { optionText: { type: String, required: true }, isCorrect: { type: Boolean, required: true } },
      ],
      marks: { type: Number, required: true },
    },
  ],
  passingMarks: { type: Number, required: true }, // Marks required to pass
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Admin user
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

export const Quiz = mongoose.model("Quiz", quizSchema);
