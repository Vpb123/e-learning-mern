import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useCreateQuizMutation } from "@/features/api/courseApi";
import { Loader2, ArrowLeft} from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
const QuizTab = () => {
  const [questions, setQuestions] = useState([]);
  const [passingMarks, setPassingMarks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
   const params = useParams();
   const navigate = useNavigate();
  const courseId = params.courseId;
  const [createQuiz] = useCreateQuizMutation();

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: [{ optionText: "", isCorrect: false }], marks: 0 },
    ]);
  };

  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const updateOption = (qIndex, oIndex, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options[oIndex][field] = value;
    setQuestions(updatedQuestions);
  };

  const addOption = (qIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.push({ optionText: "", isCorrect: false });
    setQuestions(updatedQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].options.splice(oIndex, 1);
    setQuestions(updatedQuestions);
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleCreateQuiz = async () => {
    setIsLoading(true);
    try {
      await createQuiz({ courseId, questions, passingMarks }).unwrap();
      toast.success("Quiz created successfully!");
      setQuestions([]);
      setPassingMarks(0);
      navigate(`/admin/course/${courseId}`);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to create quiz.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
        <Link to={`/admin/course/${courseId}/lecture`}>
            <Button size="icon" variant="outline" className="rounded-full mt-2 mr-2 float-right">
              <ArrowLeft size={16} />
            </Button>
          </Link>
      <CardHeader>
        <CardTitle>Create Quiz</CardTitle>
        <CardDescription>
          Add questions, options, and set correct answers. Save when done.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="my-4">
          <Label>Passing Marks</Label>
          <Input
            type="number"
            value={passingMarks}
            onChange={(e) => setPassingMarks(e.target.value)}
            placeholder="Set passing marks"
          />
        </div>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="my-6 border p-4 rounded">
            <Label>Question</Label>
            <Input
              type="text"
              value={question.questionText}
              onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
              placeholder={`Question ${qIndex + 1}`}
            />
            <Label className="mt-4">Marks</Label>
            <Input
              type="number"
              value={question.marks}
              onChange={(e) => updateQuestion(qIndex, "marks", e.target.value)}
              placeholder="Marks for this question"
            />
            <Label className="mt-4">Options</Label>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center gap-4 mt-2">
                <Input
                  type="text"
                  value={option.optionText}
                  onChange={(e) =>
                    updateOption(qIndex, oIndex, "optionText", e.target.value)
                  }
                  placeholder={`Option ${oIndex + 1}`}
                />
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={option.isCorrect}
                    onChange={(e) =>
                      updateOption(qIndex, oIndex, "isCorrect", e.target.checked)
                    }
                  />
                  Correct
                </label>
                <Button
                  variant="destructive"
                  onClick={() => removeOption(qIndex, oIndex)}
                >
                  Remove Option
                </Button>
              </div>
            ))}
            <Button className="mt-4 mr-4" onClick={() => addOption(qIndex)}>
              Add Option
            </Button>
            <Button
              variant="destructive"
              className="mt-4"
              onClick={() => removeQuestion(qIndex)}
            >
              Remove Question
            </Button>
          </div>
        ))}

        <Button className="mt-4" onClick={addQuestion}>
          Add Question
        </Button>

        <div className="mt-6">
          <Button disabled={isLoading} onClick={handleCreateQuiz}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving Quiz...
              </>
            ) : (
              "Save Quiz"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizTab;
