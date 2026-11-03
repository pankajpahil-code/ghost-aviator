import type { DemoQuestion } from "./demo-questions";

// Adapted from the instructor's worked questions 1–7 in nav-16.
const exercises: [string, string[], number, string][] = [
  ["After 60 NM along track, a fix lies 7 NM left of the planned track. Estimate the track error.", ["7° right", "7° left", "1° left", "6° left"], 1, "60 × 7 / 60 = 7°. The fix lies left of the planned track."],
  ["After 120 NM along track, a fix lies 8 NM right of track. Estimate the track error.", ["8° right", "4° left", "4° right", "16° right"], 2, "60 × 8 / 120 = 4° right. Using the offset directly would assume a 60 NM leg."],
  ["After 90 NM along track, a fix lies 6 NM right of track. Estimate the track error.", ["4° right", "6° right", "4° left", "9° right"], 0, "60 × 6 / 90 = 4° right. Use the distance already covered."],
  ["After 30 NM along track, a fix lies 4 NM left of track. Estimate the track error.", ["2° left", "4° left", "8° right", "8° left"], 3, "60 × 4 / 30 = 8° left. The same offset over a shorter distance represents a larger angle."],
  ["The planned track is 045° true. After 80 NM along track the aircraft is 4 NM left. Estimate the track made good.", ["048° true", "042° true", "041° true", "045° true"], 1, "Track error is 60 × 4 / 80 = 3° left. Track made good is 045° − 3° = 042° true. This describes the track already flown."],
  ["The planned track is 220° true. After 45 NM along track the aircraft is 3 NM right. Estimate the track made good.", ["216° true", "223° true", "224° true", "220° true"], 2, "Track error is 60 × 3 / 45 = 4° right. Add it to the planned track to obtain 224° true."],
  ["The planned track is 315° true. After 40 NM along track the aircraft is 6 NM left. Estimate the track made good.", ["306° true", "324° true", "309° true", "315° true"], 0, "Track error is 60 × 6 / 40 = 9° left. Subtract 9° from 315° to obtain 306° true."],
];

export const NAV_ONE_IN_SIXTY: DemoQuestion[] = exercises.map(([q, opts, ans, exp]) => ({
  subjectIds: ["air-navigation"], chapterId: "nav-16", subtopic: "The 1 in 60 rule",
  source: "Ghost Aviator chapter practice", q, opts, ans, exp,
}));
