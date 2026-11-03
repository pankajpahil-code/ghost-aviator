"use client";

type Props = {
  current: number;
  answers: (number | null)[];
  onSelect: (index: number) => void;
  onSubmit: () => void;
};

export default function QuestionNavigation({ current, answers, onSelect, onSubmit }: Props) {
  const unanswered = answers.filter(answer => answer === null).length;
  function choose(index: number) {
    onSelect(index);
    window.scrollTo(0, 0);
  }
  function finish() {
    const message = unanswered
      ? `${unanswered} unanswered ${unanswered === 1 ? "question" : "questions"} will score zero. Submit your final answers?`
      : "Submit your final answers? You can review the results afterwards.";
    if (window.confirm(message)) onSubmit();
  }
  return (
    <nav aria-label="Question navigation" className="mt-5 space-y-4">
      <p className="text-sm text-slate-300">
        You can change any answer until you submit. {unanswered} unanswered.
      </p>
      <details>
        <summary className="cursor-pointer text-orange-200">Choose a question</summary>
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Question list">
        {answers.map((answer, index) => (
          <button key={index} type="button" onClick={() => choose(index)}
                  aria-current={current === index ? "step" : undefined}
                  aria-label={`Question ${index + 1}, ${answer === null ? "unanswered" : "answered"}`}
                  className={`min-h-11 min-w-11 rounded-lg border px-2 ${current === index ? "border-orange-300 text-orange-200" : answer === null ? "border-slate-600 text-slate-300" : "border-emerald-600 bg-emerald-950 text-emerald-200"}`}>
            {index + 1}
          </button>
        ))}
      </div>
      </details>
      <div className="flex flex-wrap gap-3">
        <button type="button" disabled={current === 0} onClick={() => choose(current - 1)}
                className="rounded-lg border border-slate-500 px-4 py-3 text-slate-200 disabled:opacity-40">
          Previous Question
        </button>
        {current < answers.length - 1 && (
          <button type="button" onClick={() => choose(current + 1)}
                  className="rounded-lg border border-orange-400 px-4 py-3 text-orange-200">
            Next Question
          </button>
        )}
        <button type="button" onClick={finish} className="rounded-lg bg-orange-400 px-4 py-3 font-bold text-slate-950">
          Submit &amp; See Results
        </button>
      </div>
    </nav>
  );
}
