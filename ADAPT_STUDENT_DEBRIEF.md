# ADAPT — student debrief form

*A structured debrief for any student who has actually sat an airline screening
battery. Their answers are the single most valuable thing that can happen to
this project, and they cost nothing.*

---

## Why this exists

Every item count and time limit in our simulator is currently a best guess. The
publisher does not publish the format, and the coaching blogs that do are not a
source we are willing to stand behind. **Capt. Pahil teaches the exact people
who have sat the real thing.** Ten filled-in copies of this form are worth more
than any practice bundle, because they describe the real assessment as
candidates actually experienced it rather than as a marketing page describes it.

**Ask nothing that would breach their NDA.** Do not ask for questions, answers,
or anything they were told to keep confidential. Everything below is about
*shape and feel* — how long, how many, how hard, what it looked like. That is
all we need, and it is not what an NDA protects.

---

## How to use it

Send it to any student who has sat IndiGo's cadet screening, or any other
airline battery that uses the same platform. WhatsApp is fine — the form is
deliberately short enough to answer on a phone.

When answers come back, put the numbers into `MODULES` in
`lib/adapt/session.mjs` — every count and clock lives in that one table
precisely so this is a small change — and update the "provisional" wording in
`app/adapt-test/page.tsx` to say what is now confirmed.

---

## The form

**About your sitting**

1. Which airline / programme, and roughly when (month and year)?
2. Where did you sit it — test centre, or at home on your own computer?
3. What did you use: a mouse, a trackpad, or was a joystick provided?

**Overall shape**

4. How many separate tests or sections were there in total?
5. Roughly how long did the whole thing take, start to finish?
6. In what order did they come?
7. Was there a break, and could you choose when to start each section?

**For each section you remember — repeat these five**

8. What was it called on screen?
9. Roughly how many questions, and how long were you given?
10. Was there a countdown on screen, and did it show per question or for the whole section?
11. Could you go back to a previous question, or was it one-way?
12. Did it get harder as you went, or stay level?

**The maths / numerical section**

13. Was a calculator allowed? Rough paper?
14. What kind of sums — speed/distance/time, fuel, percentages, ratios, something else?
15. Roughly how many could you finish in the time?

**The multitasking test (often called FAST)**

16. How many things were happening at once, and what were they?
17. Was there sound? Headphones, or speakers? Was it speech or tones?
18. If it was speech — what did it say? (Callsigns? Numbers? Instructions?)
19. How long did it run?
20. Did it get harder as it went on?

**The tracking / co-ordination test**

21. What did you have to keep centred, and what were you moving it with?
22. How long did it run?
23. Was it one continuous run or several short ones?
24. Did anything else happen at the same time?

**The personality questionnaire**

25. Roughly how many questions?
26. What shape were they — agree/disagree, or "most like me / least like me"?
27. Was there a time limit?

**Feel**

28. What surprised you most?
29. What do you wish you had practised?
30. What did people around you find hardest?

---

## What to do with the answers

| If they say… | Change |
|---|---|
| a different question count or time limit | `MODULES` in `lib/adapt/session.mjs` |
| the multitasking audio is speech, not tones | the VoiceBank decision moves up the list — `DividedAttentionTask.tsx` was built so a spoken callsign drops into the same slot without touching the scoring |
| there are sections we do not have | a new module, same pattern as the others |
| a section works differently than we assumed | the module's engine, then its tests |

**Two or three good debriefs are enough to replace every provisional number in
the build.** Ten would make this the best-documented free description of that
assessment anywhere in India.
