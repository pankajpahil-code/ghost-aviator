import type { GuideSection } from "@/app/components/PageGuide";

export const ADAPT_GUIDE_TITLE = "How to prepare for an airline pilot aptitude test like ADAPT";
export const ADAPT_GUIDE_INTRO =
  "Airline and cadet-programme selection often begins with a computer-based aptitude assessment, and ADAPT is one of the names students hear most. This guide explains what that kind of test measures and how to use the free practice on this page. It is independent practice material, not an official test.";

export const ADAPT_GUIDE_SECTIONS: GuideSection[] = [
  {
    h: "What an aptitude screening measures",
    p: [
      "These batteries are not a knowledge exam. They look at how quickly and accurately you handle mental arithmetic, physics and mechanical reasoning, spatial orientation, and several tasks at once. They also include a hand-eye task and questions about attitudes and airmanship.",
      "Each airline or programme decides what it uses, how it scores and what result it needs. Check the official notice of the programme you are applying to rather than relying on figures quoted on forums or in coaching groups.",
    ],
  },
  {
    h: "What this practice covers",
    p: ["The practice on this page is built around the same kinds of skills, under a clock:"],
    list: [
      "Aviation maths, timed and without a calculator.",
      "Physics and mechanical reasoning.",
      "Spatial reasoning and pattern questions.",
      "A control and co-ordination task, where you hold a drifting marker on the centre.",
      "A divided-attention module, which adds a second demand on top of the first.",
      "An attitudes and airmanship questionnaire.",
    ],
  },
  {
    h: "Understanding stanine scoring",
    p: [
      "Results are shown on the stanine scale, which runs from 1 to 9 with 5 at the middle. A stanine tells you roughly where your raw score sits compared with other candidates, not how many questions you got right. The raw score needed for each stanine is printed on your result here, so you can see what moved you.",
      "The stanine you need for a real programme is that programme's decision, and it can change. Treat the scale as a way to track your own improvement.",
    ],
  },
  {
    h: "A four-week approach",
    p: [
      "Build arithmetic speed first, because everything else sits on top of it. Practise a little every day instead of a lot once a week. In the second week add orientation and the tracking task. In the third week add the divided-attention module and full timed sittings. In the fourth week keep sessions light, review your progress and rest. The plan further down this page sets this out week by week.",
    ],
  },
  {
    h: "Habits that help on the day",
    p: [
      "Work to the clock rather than fighting a single hard question. A skipped question costs less than the three you lose while stuck on it. Learn the common conversions by heart, such as minutes to hours and knots to distance per minute, because they come up in every arithmetic section.",
      "Sleep, eat and arrive early. Tiredness shows up first in the exact skills these tests measure.",
    ],
  },
  {
    h: "How to read your results",
    p: [
      "A single sitting tells you less than a pattern across several. Look at which module drags your result down, and give that module most of your next week. Candidates often find that maths speed is steady but falls sharply when a second task is added, which is exactly why the divided-attention module exists.",
      "Keep a short note after each session: what you got wrong, why, and what you will change. The explanations shown for each wrong option are there to make that note easy to write.",
    ],
  },
  {
    h: "Privacy",
    p: [
      "The test on this page is generated and scored in your browser, and your answers stay on your device. You can practise as often as you like without anyone seeing the results.",
    ],
  },
];