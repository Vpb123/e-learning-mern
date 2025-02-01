import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { useSubmitQuizMutation, useGetCourseQuizzesQuery } from "@/features/api/courseApi";
import { toast } from "sonner";
import { useLoadUserQuery } from "@/features/api/authApi";
import * as htmlToImage from "html-to-image";
import { saveAs } from "file-saver";

const TakeQuiz = () => {
  const { courseId } = useParams();
  
  const userData = useLoadUserQuery();
  const user = userData.data.user.name;
  const { data: quizResponse, isLoading } = useGetCourseQuizzesQuery(courseId);
  const quizData = quizResponse?.quiz;
  const instructor =  quizData?.createdBy.name;
  const [submitQuiz] = useSubmitQuizMutation();
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [quizReady, setQuizReady] = useState(false);

  const certificateRef = useRef();

  // Initialize answers and timer only when quiz data is loaded
  useEffect(() => {
    if (quizData) {
      const defaultAnswers = {};
      quizData.questions.forEach((question) => {
        defaultAnswers[question._id] = null; // Set all answers to null initially
      });
      setAnswers(defaultAnswers);

      const totalQuestions = quizData.questions.length;
      setTimeLeft(totalQuestions * 120); // 2 minutes per question
      setQuizReady(true); // Mark quiz as ready
    }
  }, [quizData]);

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0 && quizReady && !quizSubmitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && quizReady && !quizSubmitted) {
      handleSubmitQuiz();
    }
  }, [timeLeft, quizSubmitted, quizReady]);

  const handleAnswerChange = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmitQuiz = async () => {
    // Ensure the quiz is ready before submission
    if (!quizReady) {
      toast.error("Quiz is not ready. Please wait.");
      return;
    }

    // Check if any answer is selected
    const hasAnswered = Object.values(answers).some((answer) => answer !== null);
    if (!hasAnswered) {
      toast.error("Please answer at least one question before submitting.");
      return;
    }

    try {
      const response = await submitQuiz({ courseId, answers }).unwrap();

      // Correctly set result with score and passed values
      setResult({ score: response.score, passed: response.passed });
      setTimeLeft(0);
      setQuizSubmitted(true);

      toast.success(response.message);
    } catch (error) {
      toast.error(error?.data?.message || "Failed to submit quiz.");
    }
  };

  const downloadCertificate = async () => {
    if (certificateRef.current) {
      const dataUrl = await htmlToImage.toPng(certificateRef.current);
      saveAs(dataUrl, "certificate.png");
      toast.success("Certificate downloaded!");
    }
  };

  if (isLoading || !quizReady) return <p>Loading quiz...</p>; // Ensure quiz is ready before rendering
  if (!quizData) return <p>No quiz available for this course.</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Take Quiz</h1>
      <p>
        Time left: {Math.floor(timeLeft / 60)}:
        {timeLeft % 60 < 10 ? `0${timeLeft % 60}` : timeLeft % 60}
      </p>
      {!quizSubmitted ? (
        <div>
          {quizData.questions.map((question, qIndex) => (
            <Card key={question._id} className="mb-4">
              <CardContent className="p-6">
                <CardTitle>
                  Q{qIndex + 1}: {question.questionText}
                </CardTitle>
                {question.options.map((option) => (
                  <div key={option._id} className="mt-2">
                    <input
                      type="radio"
                      id={`q${qIndex}-o${option._id}`}
                      name={`q${qIndex}`}
                      checked={answers[question._id] === option._id}
                      onChange={() => handleAnswerChange(question._id, option._id)}
                    />
                    <label htmlFor={`q${qIndex}-o${option._id}`} className="ml-2">
                      {option.optionText}
                    </label>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
          <Button className="mt-4" onClick={handleSubmitQuiz}>
            Submit Quiz
          </Button>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-bold">
            {result?.passed ? "You Passed!" : "You Failed"}
          </h2>
          <p>
            Your Score: {result?.score} /{" "}
            {quizData.questions.reduce((acc, q) => acc + q.marks, 0)}
          </p>
          {result?.passed && (
            <div className="mt-4">
              <div
                ref={certificateRef}
                className="border-4 border-blue-700 bg-white p-10 shadow-lg mt-10 text-center"
                style={{
                  fontFamily: "'Georgia', serif",
                  color: "#333",
                  maxWidth: "800px",
                  height:"400px",
                  margin: "0 auto",
                  display:'flex',
                  flexDirection:'column',
                  justifyContent:'space-between'
                }}
              >
                <h1 className="text-3xl font-bold mb-4">Certificate of Completion</h1>
                <p className="text-lg">This certifies that</p>
                <h2 className="text-2xl font-bold my-2">{user}</h2>
                <p className="text-lg">has successfully completed the course</p>
                <h3 className="text-xl font-semibold my-2">{ quizData.courseId.courseTitle }</h3>
                <p className="text-sm mt-4">Date: {new Date().toLocaleDateString()}</p>
                <p className="text-sm">Signed by: <b>{instructor}</b></p>
              </div>
              <Button className="mt-4" onClick={downloadCertificate}>
                Download Certificate
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
