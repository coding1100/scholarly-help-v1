"use client";

interface Step8Props {
  totalQuestions: number;
  correctAnswers: number;
  incorrectQuestionNumbers: number[];
  onPracticeMore?: () => void;
  onChooseAnotherTopic?: () => void;
}

export default function Step8({
  totalQuestions,
  correctAnswers,
  incorrectQuestionNumbers,
  onPracticeMore,
  onChooseAnotherTopic,
}: Step8Props) {
  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className=" min-h-tool-body overflow-y-auto flex mt-10 justify-center p-4 bg-linear-to-br from-[#f6f3f4] to-[#ebe6e7]">
      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-2xl relative">
        <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
          {/* Inner glow effect */}
          <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Title */}
            <p className="text-2xl font-semibold text-black text-center mb-8">
              Quiz Complete! 🎉
            </p>

            {/* Score Circle */}
            <div className="relative w-32 h-32 mb-6">
              {/* Circular Progress Background */}
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-300"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 56 * (1 - scorePercentage / 100)
                  }`}
                  className="text-[#2b7fff] transition-all duration-500"
                  strokeLinecap="round"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-semibold text-black">
                  {scorePercentage}%
                </span>
                <span className="text-sm text-gray-600 mt-1">Score</span>
              </div>
            </div>

            {/* Quiz Summary */}
            <p className="text-lg text-black text-center mb-8">
              You got {correctAnswers} out of {totalQuestions} questions
              correct!
            </p>

            {/* Areas to Focus On */}
            {incorrectQuestionNumbers.length > 0 && (
              <div className="w-full mb-8">
                <div className="backdrop-blur-md bg-white/40 border border-gray-300/50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-black mb-4">
                    Areas to Focus On:
                  </h3>
                  <div className="space-y-2">
                    {incorrectQuestionNumbers.map((questionNum) => (
                      <p key={questionNum} className="text-black font-medium">
                        Question {questionNum}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full space-y-4">
              <button
                onClick={onPracticeMore}
                className="w-full py-4 rounded-xl bg-[#2b7fff] hover:bg-[#155dfc] text-white font-bold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                Practice More
              </button>
              <button
                onClick={onChooseAnotherTopic}
                className="w-full py-4 rounded-xl bg-white/40 backdrop-blur-md border border-gray-300/50 hover:bg-white/50 text-black font-bold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
              >
                Choose Another Topic
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
