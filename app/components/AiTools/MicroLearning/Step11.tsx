"use client";

interface Step11Props {
  totalQuestions: number;
  correctAnswers: number;
  incorrectQuestionNumbers: number[];
  onStartOver: () => void;
}

export default function Step11({
  totalQuestions,
  correctAnswers,
  incorrectQuestionNumbers,
  onStartOver,
}: Step11Props) {
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
      <div className="w-full max-w-2xl">
        {/* Results Card */}
        <div className="bg-[#F0F0F0] rounded-3xl p-8 md:p-12 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#333333] mb-2">
              Quiz Complete! 🎉
            </h1>
          </div>

          {/* Score Circle */}
          <div className="flex justify-center mb-8">
            <div className="relative w-40 h-40">
              {/* Circular Progress Background */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  className="text-[#D7D7D7]"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 70 * (1 - scorePercentage / 100)
                  }`}
                  className={`transition-all duration-500 ${
                    scorePercentage >= 80
                      ? "text-[#00c951]"
                      : scorePercentage >= 60
                        ? "text-yellow-500"
                        : "text-[#fb2c36]"
                  }`}
                  strokeLinecap="round"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-[#333333]">
                  {scorePercentage}%
                </span>
                <span className="text-sm text-[#666666] mt-1">Score</span>
              </div>
            </div>
          </div>

          {/* Quiz Summary */}
          <div className="text-center mb-8">
            <p className="text-xl text-[#333333] font-semibold mb-1">
              You got {correctAnswers} out of {totalQuestions} questions
              correct!
            </p>
            <p className="text-[#666666] text-lg">
              {scorePercentage >= 80
                ? "Excellent work! 🎉"
                : scorePercentage >= 60
                  ? "Good job! Keep practicing! 💪"
                  : "Keep learning! You'll get better! 📚"}
            </p>
          </div>

          {/* Areas to Focus On */}
          {/* {incorrectQuestionNumbers.length > 0 && (
                        <div className="mb-8">
                            <div className="bg-white rounded-2xl p-6 border-2 border-[#D7D7D7]">
                                <h3 className="text-xl font-bold text-[#333333] mb-4">
                                    Areas to Focus On:
                                </h3>
                                <div className="space-y-2">
                                    {incorrectQuestionNumbers.map((questionNum) => (
                                        <div
                                            key={questionNum}
                                            className="flex items-center gap-2 text-[#333333]"
                                        >
                                            <span className="text-[#fb2c36] font-bold">●</span>
                                            <span className="font-medium">Question {questionNum}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )} */}

          {/* Action Button */}
          <div className="flex justify-center">
            <button
              onClick={onStartOver}
              className="px-8 py-3 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
