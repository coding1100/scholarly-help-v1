"use client";

interface Step5Props {
  goals?: string[];
  minutesPerDay?: number;
  topics?: string[];
  onStart?: () => void;
}

// Map goal keys to labels
const goalLabels: Record<string, string> = {
  "career-development": "Career Development",
  "skill-building": "Skill Building",
  "personal-growth": "Personal Growth",
  "academic-learning": "Academic Learning",
  "hobby-interests": "Hobby & Interests",
  "professional-certification": "Professional Certification",
};

export default function Step5({
  goals = [],
  minutesPerDay = 15,
  topics = [],
  onStart,
}: Step5Props) {
  // Map goal keys to labels, or use custom goals as-is
  const displayGoals = goals.map((goal) => goalLabels[goal] || goal);
  return (
    <div className="flex justify-center px-4 py-8 bg-white">
      <div className="w-full max-w-5xl">
        <div className="bg-[#F0F0F0] rounded-3xl p-10  shadow-2xl">
          {/* Checkmark Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-10 h-10 bg-[#00c951] rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Title */}
          <p className="text-xl font-semibold text-[#333333] text-center mb-3">
            You're all set!
          </p>

          {/* Subtitle */}
          <p className="text-[#666666] text-sm text-center mb-6">
            Here's your personalized learning plan:
          </p>

          {/* Learning Plan Details */}
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Goals */}
            {displayGoals.length > 0 && (
              <div>
                <p className="text-[#333333] font-semibold mb-3">Goals:</p>
                <div className="flex flex-wrap gap-3">
                  {displayGoals.map((goal, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-lg bg-linear-to-r from-[#6C757D] to-[#868E96] text-[#333333] font-medium shadow-md border border-gray-400"
                    >
                      {goal}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Time per day */}
            <div>
              <p className="text-[#333333] font-semibold mb-1">Time per day:</p>
              <p className="text-[#333333]">{minutesPerDay} minutes</p>
            </div>

            {/* Topics */}
            {topics.length > 0 && (
              <div>
                <p className="text-[#333333] font-semibold mb-3">Topics:</p>
                <div className="flex flex-wrap gap-3">
                  {topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 rounded-lg bg-linear-to-r from-[#6C757D] to-[#868E96] text-[#333333] font-medium shadow-md border border-gray-400"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Start Learning Button */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onStart}
              className="px-6 py-3 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
            >
              Start Learning! 🚀
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
