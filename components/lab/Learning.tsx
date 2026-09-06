'use client';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  FlaskConical,
  Lightbulb,
  RotateCcw,
  X,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { lessons, questions, type Question } from '@/lib/content';
import { Cutaway } from './ComponentDetail';
import type { ComponentId, SimState } from '@/lib/simulation';
export function QuestionCard({
  question: q,
  answer,
  onAnswer,
  number,
}: {
  question: Question;
  answer: number | undefined;
  onAnswer: (i: number) => void;
  number?: number;
}) {
  return (
    <div className="question-card">
      <div className="question-topic">
        {number !== undefined
          ? `SORU ${String(number).padStart(2, '0')} / `
          : ''}
        {q.topic}
      </div>
      <h3>{q.prompt}</h3>
      <div className="answer-options">
        {q.options.map((option, i) => (
          <button
            key={option}
            disabled={answer !== undefined}
            onClick={() => onAnswer(i)}
            className={
              answer === undefined
                ? ''
                : i === q.correct
                  ? 'correct-answer'
                  : answer === i
                    ? 'wrong-answer'
                    : 'unused-answer'
            }
          >
            <span className="option-letter">{'ABC'[i]}</span>
            <span>{option}</span>
            {answer !== undefined && i === q.correct ? (
              <Check size={18} />
            ) : answer === i ? (
              <X size={18} />
            ) : null}
          </button>
        ))}
      </div>
      {answer !== undefined && (
        <output className="answer-feedback">
          <strong className={answer === q.correct ? 'green' : 'amber'}>
            {answer === q.correct
              ? 'Doğru. Mantığı yakaladın.'
              : 'Bu cevap doğru değil. Bağlantıyı inceleyelim.'}
          </strong>
          <ul>
            {q.reasons.map((reason, i) => (
              <li key={reason}>
                <b className={i === q.correct ? 'green' : ''}>
                  {'ABC'[i]} {i === q.correct ? '✓' : '×'}
                </b>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </output>
      )}
    </div>
  );
}
export function LearnMode({
  state,
  onExperiment,
  onChange,
}: {
  state: SimState;
  onExperiment: (id: ComponentId) => void;
  onChange: (p: Partial<SimState>) => void;
}) {
  const [chapter, setChapter] = useState(0),
    [answers, setAnswers] = useState<Record<string, number>>({});
  const lesson = lessons[chapter];
  const complete = (ids: string[]) =>
      ids.every((id) => answers[id] !== undefined),
    count = lessons.filter((l) => complete(l.questions)).length;
  return (
    <div className="learning-layout">
      <aside className="lesson-sidebar panel">
        <div className="lesson-progress">
          <BookOpen size={20} />
          <h2>Öğrenme rotan</h2>
          <span>{count} / 8 bölüm</span>
          <Progress value={(count / 8) * 100} aria-label="Öğrenme ilerlemesi" />
        </div>
        <nav aria-label="Öğrenme bölümleri">
          {lessons.map((l, i) => (
            <button
              key={l.title}
              aria-current={i === chapter ? 'step' : undefined}
              onClick={() => setChapter(i)}
            >
              <span className="chapter-number">
                {complete(l.questions) ? (
                  <CheckCircle2 size={18} />
                ) : (
                  String(i + 1).padStart(2, '0')
                )}
              </span>
              <span>
                {l.title}
                <small>{l.english}</small>
              </span>
            </button>
          ))}
        </nav>
        <p className="sidebar-note">
          Her bölüm: kavram → deney → 3 kısa soru. İlerleme bu oturum boyunca
          korunur.
        </p>
      </aside>
      <article className="lesson-content">
        <div className="section-eyebrow">
          BÖLÜM {String(chapter + 1).padStart(2, '0')} / 08
        </div>
        <h2>{lesson.title}</h2>
        <p className="section-subtitle">{lesson.english}</p>
        <div className="lesson-intro panel">
          <div>
            <p>{lesson.body}</p>
            <div className="experiment-note">
              <FlaskConical size={21} />
              <div>
                <strong>Şimdi sen dene</strong>
                <p>{lesson.experiment}</p>
                <button
                  className="primary-button"
                  onClick={() => onExperiment(lesson.component)}
                >
                  Sistemde dene <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
          <div className="lesson-visual">
            <Cutaway id={lesson.component} state={state} />
            <div className="segmented">
              <button onClick={() => onChange({ mainOn: !state.mainOn })}>
                {state.mainOn ? 'Pompa OFF' : 'Pompa ON'}
              </button>
              <button
                onClick={() => onChange({ valve: state.valve === 1 ? -1 : 1 })}
              >
                {state.valve === 1 ? 'Geri çek' : 'Uzat'}
              </button>
            </div>
            <small>Canlı sistemle bağlantılı şematik kesit</small>
          </div>
        </div>
        <div className="critical-note">
          <Lightbulb size={21} />
          <p>{lesson.takeaway}</p>
        </div>
        <div className="knowledge-heading">
          <h3>Kendini kontrol et</h3>
          <span>3 kısa soru</span>
        </div>
        {lesson.questions.map((id, i) => {
          const q = questions.find((q) => q.id === id)!;
          return (
            <QuestionCard
              key={id}
              question={q}
              answer={answers[id]}
              onAnswer={(n) => setAnswers((a) => ({ ...a, [id]: n }))}
              number={i + 1}
            />
          );
        })}
        <div className="lesson-bottom">
          <button
            disabled={chapter === 0}
            onClick={() => setChapter((c) => c - 1)}
          >
            <ArrowLeft size={16} />
            Önceki bölüm
          </button>
          <span>
            {complete(lesson.questions) ? (
              <>
                <CheckCircle2 size={16} /> Bölüm tamamlandı
              </>
            ) : (
              <>
                <Circle size={15} /> Soruları cevapla
              </>
            )}
          </span>
          <button
            disabled={chapter === 7}
            className="primary-button"
            onClick={() => setChapter((c) => c + 1)}
          >
            Sonraki bölüm
            <ArrowRight size={16} />
          </button>
        </div>
      </article>
    </div>
  );
}
export function ExamMode() {
  const [index, setIndex] = useState(0),
    [answers, setAnswers] = useState<Record<string, number>>({}),
    [finished, setFinished] = useState(false);
  const answered = Object.keys(answers).length,
    correct = questions.filter((q) => answers[q.id] === q.correct).length,
    wrong = answered - correct;
  const wrongTopics = Array.from(
    new Set(
      questions
        .filter(
          (q) => answers[q.id] !== undefined && answers[q.id] !== q.correct,
        )
        .map((q) => q.topic),
    ),
  );
  const question = questions[index];
  function reset() {
    setAnswers({});
    setIndex(0);
    setFinished(false);
  }
  return (
    <div className="exam-layout">
      <div className="exam-main">
        <div className="section-eyebrow">HEE 305 / ATA 29</div>
        <h2>Sınav provası</h2>
        <p className="section-subtitle">
          24 özgün soru. Her seçeneğin nedenini öğren.
        </p>
        <p className="exam-disclaimer">
          Part-66 tarzında çalışma soruları; resmî soru bankası veya onaylı
          sınav değildir.
        </p>
        {finished ? (
          <div className="exam-result panel">
            <div className="result-icon">
              <CheckCircle2 size={34} />
            </div>
            <span>PROVA TAMAMLANDI</span>
            <h3>%{Math.round((correct / questions.length) * 100)}</h3>
            <p>
              {questions.length} soruda <b>{correct} doğru</b>, {wrong} yanlış.
            </p>
            <h4>
              {wrongTopics.length
                ? 'Tekrar etmen gereken konular'
                : 'Tüm konularda doğru cevap verdin.'}
            </h4>
            <div className="topic-tags">
              {wrongTopics.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <div className="result-actions">
              <button
                onClick={() => {
                  setFinished(false);
                  setIndex(0);
                }}
              >
                Cevapları incele
                <BookOpen size={16} />
              </button>
              <button className="primary-button" onClick={reset}>
                <RotateCcw size={16} />
                Yeniden başla
              </button>
            </div>
          </div>
        ) : (
          <>
            <Progress
              value={(answered / questions.length) * 100}
              aria-label="Sınav ilerlemesi"
            />
            <QuestionCard
              question={question}
              answer={answers[question.id]}
              onAnswer={(n) => setAnswers((a) => ({ ...a, [question.id]: n }))}
              number={index + 1}
            />
            <div className="exam-controls">
              <button
                disabled={index === 0}
                onClick={() => setIndex((i) => i - 1)}
              >
                <ArrowLeft size={16} />
                Önceki
              </button>
              <span>
                {index + 1} / {questions.length}
              </span>
              {index === questions.length - 1 ? (
                <button
                  className="primary-button"
                  disabled={answered !== questions.length}
                  onClick={() => setFinished(true)}
                >
                  Sonucu göster
                  <CheckCircle2 size={16} />
                </button>
              ) : (
                <button
                  className="primary-button"
                  disabled={answers[question.id] === undefined}
                  onClick={() => setIndex((i) => i + 1)}
                >
                  Sonraki soru
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      <aside className="exam-sidebar panel">
        <div className="detail-kicker">OTURUM SKORU</div>
        <div className="score-total">
          {answered}
          <span> / {questions.length} cevaplandı</span>
        </div>
        <div className="score-grid">
          <div>
            <strong className="green">{correct}</strong>
            <span>Doğru</span>
          </div>
          <div>
            <strong className="red">{wrong}</strong>
            <span>Yanlış</span>
          </div>
          <div>
            <strong>
              {answered ? Math.round((correct / answered) * 100) : 0}%
            </strong>
            <span>Başarı</span>
          </div>
        </div>
        <small>Başarı yüzdesi cevaplanan sorular üzerinden hesaplanır.</small>
        <div className="question-dots">
          {questions.map((q, i) => (
            <button
              key={q.id}
              aria-label={`Soru ${i + 1}`}
              aria-current={i === index ? 'step' : undefined}
              className={
                answers[q.id] === undefined
                  ? ''
                  : answers[q.id] === q.correct
                    ? 'dot-correct'
                    : 'dot-wrong'
              }
              onClick={() => {
                setIndex(i);
                setFinished(false);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <h3>Tekrar listesi</h3>
        {wrongTopics.length ? (
          <ul className="wrong-topics">
            {wrongTopics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        ) : (
          <p className="muted">Henüz yanlış cevaplanan konu yok.</p>
        )}
      </aside>
    </div>
  );
}
