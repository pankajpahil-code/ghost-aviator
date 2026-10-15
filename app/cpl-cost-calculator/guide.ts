import type { GuideSection } from "@/app/components/PageGuide";

export const COST_GUIDE_TITLE = "What goes into the cost of a CPL in India";
export const COST_GUIDE_INTRO =
  "The calculator above turns the main parts of commercial pilot training into one budget. This guide explains each part so you can ask a flying school the right questions. It deliberately avoids quoting fees: prices differ between schools and change often, so use the figures a school gives you in writing.";

export const COST_GUIDE_SECTIONS: GuideSection[] = [
  {
    h: "Flying hours",
    p: [
      "Flying is usually the largest line in the budget. The calculator uses hours multiplied by an hourly rate, and the DGCA minimum for a CPL is 200 hours. Many students need more than the minimum, so ask the school how it handles extra hours and whether the rate is the same for them.",
      "Ask which aircraft the rate covers, whether instructor, fuel and landing charges are included, and what happens when weather or aircraft availability delays your training.",
    ],
  },
  {
    h: "DGCA ground exams",
    p: [
      "Each written subject has an exam fee, and a student who does not pass pays again for each re-attempt. The calculator assumes you pass at the first attempt, so add a margin if you want to be cautious. Good preparation lowers this cost more than any other, which is why the notes, question bank and mock tests on this site are free.",
    ],
  },
  {
    h: "Medicals",
    p: [
      "A DGCA Class 1 medical is required for a CPL. The DGCA publishes lists of approved Class 1 and Class 2 medical examiners, and the Resources page on this site links to them. Do the Class 1 medical early, before you commit large sums to training, so that you find out first whether you are fit to fly commercially.",
    ],
  },
  {
    h: "Ground school and tuition",
    p: [
      "Some schools bundle ground classes into one fee and others charge separately. Compare like with like. If you are studying alone with free material, you may only need paid classes for the subjects you find hardest.",
    ],
  },
  {
    h: "Living costs and duration",
    p: [
      "Food, accommodation and travel add up over the months of training, and they grow if the course runs long. The calculator lets you set both the duration and the monthly cost, so try a slower scenario as well as the best case.",
    ],
  },
  {
    h: "What comes after the licence",
    p: [
      "A CPL does not on its own put you in an airline cockpit. Type rating and airline selection costs usually come after the licence, as the note above the calculator says, and they are not included in the total shown. Plan for them separately.",
    ],
  },
  {
    h: "How to use the calculator honestly",
    p: [
      "Run it three times: a best case, a likely case and a slow case. If the slow case is not affordable for your family, that matters more than the best-case number. Then replace each default with the figure from a written quote and see how the total moves.",
      "The contingency buffer is there because training rarely runs exactly to plan. Do not remove it to make the total look smaller.",
    ],
  },
  {
    h: "Questions to ask any flying school",
    p: [],
    list: [
      "Is the hourly rate all-inclusive, and what is charged on top?",
      "What is the school's record for finishing the hours within the stated months?",
      "What happens to your fees if you leave or if the course is paused?",
      "Which aircraft will you fly, and how many are available to students?",
      "Can you see the full fee breakdown in writing before you pay?",
    ],
  },
];