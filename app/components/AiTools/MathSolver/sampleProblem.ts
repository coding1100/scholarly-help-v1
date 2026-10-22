/**
 * Bridges the "Try a sample stats question" link in MathSolverHero to the
 * actual StemSolver input, which lives several components deep (behind a
 * dynamic import with no exposed props/ref). A custom DOM event avoids prop
 * drilling through MathSolverEmbed/MathSolver for a single one-off action.
 */
export const LOAD_SAMPLE_PROBLEM_EVENT = "math-solver:load-sample-problem";

export const SAMPLE_STATS_PROBLEM =
  "A class of 9 students scored the following on a quiz: 72, 85, 90, 65, 78, 88, 91, 76, 82. Find the mean, median, and mode of these scores.";
