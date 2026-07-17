"use client";

import { useState } from "react";
import Step7 from "./Step7";
import Step8 from "./Step8";

interface Step6Props {
  dayStreak?: number;
  bestStreak?: number;
  lessonsCompleted?: number;
  hoursLearned?: number;
  topicsExplored?: number;
  todayLessonMinutes?: number;
  selectedTopic?: string;
  onStartLesson?: (duration: number, topic: string) => void;
  onReviewFlashcards?: () => void;
  onViewProgress?: () => void;
  onStartNow?: () => void;
}

export default function Step6({
  dayStreak = 0,
  bestStreak = 0,
  lessonsCompleted = 0,
  hoursLearned = 0,
  topicsExplored = 0,
  todayLessonMinutes = 10,
  selectedTopic = "Science",
  onStartLesson,
  onReviewFlashcards,
  onViewProgress,
  onStartNow,
}: Step6Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);

  const handleStartLessonClick = () => {
    setIsModalOpen(true);
  };

  const handleStartLesson = (minutes: number) => {
    // Handle the actual lesson start
    console.log(`Starting ${minutes}-minute lesson on ${selectedTopic}`);
    if (onStartLesson) {
      onStartLesson(minutes, selectedTopic);
    }
  };

  const handleReviewFlashcardsClick = () => {
    setIsFlashcardModalOpen(true);
  };

  const handleCreateFlashcards = (topic: string) => {
    // Handle flashcard creation
    console.log(`Creating flashcards for topic: ${topic}`);
    if (onReviewFlashcards) {
      onReviewFlashcards();
    }
  };

  return (
    <>
      <div className="flex mt-10 justify-center p-4 bg-linear-to-br from-gray-100 to-gray-200">
        <div className="w-full max-w-6xl relative">
          <div className="backdrop-blur-xl bg-white/30 border border-white/40 rounded-3xl p-8 shadow-2xl">
            {/* Inner glow effect */}
            {/* <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-white/20 to-transparent pointer-events-none" /> */}

            <div className="max-w-6xl mx-auto py-8">
              {/* Header */}
              <div className="text-center mb-6">
                <p className="text-2xl font-semibold text-[#333333] mb-2">
                  Your Learning Dashboard
                </p>
                <p className="text-[#666666] text-sm">
                  Keep your streak going! 🔥
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Day Streak Card */}
                {/* <div className="rounded-xl bg-linear-to-r from-[#5A5A5A] to-[#6C757D] p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-2xl font-bold text-black">{dayStreak}</div>
                                <div className="text-xl">🔥</div>
                            </div>
                            <div className="text-white font-semibold mb-1">Day Streak</div>
                            <div className="text-white/80 text-sm">Best: {bestStreak} days</div>
                        </div> */}

                {/* Lessons Completed Card */}
                {/* <div className="rounded-2xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-5xl font-bold text-[#333333]">
                                    {lessonsCompleted}
                                </div>
                                <div className="text-3xl">📚</div>
                            </div>
                            <div className="text-[#333333] font-semibold">Lessons Completed</div>
                        </div> */}

                {/* Hours Learned Card */}
                {/* <div className="rounded-2xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-5xl font-bold text-[#333333]">
                                    {hoursLearned}
                                </div>
                                <div className="text-3xl">⏱️</div>
                            </div>
                            <div className="text-[#333333] font-semibold">Hours Learned</div>
                        </div> */}

                {/* Topics Explored Card */}
                {/* <div className="rounded-2xl bg-white p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-5xl font-bold text-[#333333]">
                                    {topicsExplored}
                                </div>
                                <div className="text-3xl">📖</div>
                            </div>
                            <div className="text-[#333333] font-semibold">Topics Explored</div>
                        </div> */}
              </div>

              {/* Quick Actions Section */}
              <div className="mb-10">
                <h2 className="text-xl font-semibold text-[#333333] mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Start Today's Lesson */}
                  <button
                    onClick={handleStartLessonClick}
                    className="rounded-xl bg-linear-to-r from-[#6C757D] to-[#868E96] p-6 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-start justify-between group min-h-[100px]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📘</div>
                      <div className="text-[#333333] font-semibold text-base">
                        Start Today's Lesson
                      </div>
                    </div>
                    <div className="flex items-center justify-between w-full mt-5">
                      <div className="text-[#333333] text-sm">
                        {todayLessonMinutes} minutes
                      </div>
                      <div className="text-[#333333] text-xl group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </button>

                  {/* Review Flashcards */}
                  {/* <button
                                onClick={handleReviewFlashcardsClick}
                                className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-start justify-between group min-h-[140px]"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-3xl">🎴</div>
                                    <div className="text-[#333333] font-bold text-base">
                                        Review Flashcards
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-[#666666] text-sm">All caught up!</div>
                                    <div className="text-[#6C757D] text-xl group-hover:translate-x-1 transition-transform">
                                        →
                                    </div>
                                </div>
                            </button> */}

                  {/* View Progress */}
                  {/* <button
                                onClick={onViewProgress}
                                className="rounded-2xl bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col items-start justify-between group min-h-[140px]"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="text-3xl">📊</div>
                                    <div className="text-[#333333] font-bold text-base">
                                        View Progress
                                    </div>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <div className="text-[#666666] text-sm">
                                        See your learning journey
                                    </div>
                                    <div className="text-[#6C757D] text-xl group-hover:translate-x-1 transition-transform">
                                        →
                                    </div>
                                </div>
                            </button> */}
                </div>
              </div>

              {/* Don't Break Your Streak Section */}
              <div className="rounded-2xl bg-white p-6 shadow-lg sm:flex items-center justify-between gap-6">
                <div className="flex sm:items-center items-start sm:gap-4 gap-2">
                  <div className="text-4xl">💡</div>
                  <div>
                    <div className="text-[#333333] font-semibold text-lg mb-1">
                      Don't break your streak!
                    </div>
                    <div className="text-[#666666] text-sm">
                      Complete a lesson today to keep it going
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleStartLessonClick}
                  className="sm:w-fit w-full sm:mt-0 mt-2 px-6 py-3 rounded-lg bg-[#2b7fff] hover:bg-[#155dfc] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] cursor-pointer"
                >
                  Start Now →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Duration Modal */}
      <Step7
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartLesson={handleStartLesson}
      />

      {/* Create Flashcards Modal */}
      <Step8
        isOpen={isFlashcardModalOpen}
        onClose={() => setIsFlashcardModalOpen(false)}
        onCreateFlashcards={handleCreateFlashcards}
      />
    </>
  );
}
