import { useEffect, useState } from 'react';
import {
  AVATAR_DEFAULT,
  CLASS_COLORS,
  CLASS_DESCRIPTIONS,
  CLASS_GLYPHS,
  CLASSES,
  type AvatarConfig,
  type ClassName,
} from '../types/arcana';
import { AvatarWorkshop } from './AvatarWorkshop';
import { HeroAvatar, MerlinAvatar } from './PixelSprite';

interface OnboardingFlowProps {
  existingHeroName?: string;
  initialAvatar?: AvatarConfig;
  initialClass?: ClassName;
  hasExistingSave: boolean;
  mode: 'start' | 'onboarding';
  onStartNew: () => void;
  onContinueExisting: () => void;
  onBackToStart: () => void;
  onComplete: (name: string, avatar: AvatarConfig, className: ClassName) => void;
}

const DIALOGUES = [
  'Greetings, traveler. I am Merlin, keeper of Arcana. What name shall be written in the Chronicle of your journey?',
  'Excellent. Now shape your hero. Customize your hair, eyes, clothing, and biome backdrop in crisp pixel art.',
  'Your final choice: a combat path. Each class unlocks unique skills at Level 10, while your personal appearance remains yours.',
];

export function OnboardingFlow({
  existingHeroName,
  initialAvatar,
  initialClass = 'Knight',
  hasExistingSave,
  mode,
  onStartNew,
  onContinueExisting,
  onBackToStart,
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const [heroName, setHeroName] = useState(existingHeroName || '');
  const [avatar, setAvatar] = useState<AvatarConfig>(initialAvatar || { ...AVATAR_DEFAULT });
  const [selectedClass, setSelectedClass] = useState<ClassName>(initialClass);
  const [typedText, setTypedText] = useState('');
  const [dialogDone, setDialogDone] = useState(false);

  useEffect(() => {
    if (mode !== 'onboarding') return;
    setTypedText('');
    setDialogDone(false);
    const words = DIALOGUES[step].split(' ');
    let idx = 0;
    const timer = window.setInterval(() => {
      if (idx < words.length) {
        const nextWord = words[idx];
        setTypedText((prev) => (prev ? `${prev} ${nextWord}` : nextWord));
        idx++;
      } else {
        window.clearInterval(timer);
        setDialogDone(true);
      }
    }, 60);
    return () => window.clearInterval(timer);
  }, [mode, step]);

  if (mode === 'start') {
    return (
      <div className="mx-auto flex min-h-dvh max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
        <p className="text-xs font-bold tracking-[0.25em] text-[#9b7bf0]">ARCANA</p>
        <p className="mt-2 text-sm text-[#a2a2b3]">
          A pixel RPG built from your everyday victories
        </p>

        <div className="my-8 flex items-end justify-center gap-4">
          <MerlinAvatar classNameWrapper="h-48 w-36 rounded-2xl border border-[#3d3c4c] shadow-2xl" />
          {hasExistingSave && initialAvatar && (
            <HeroAvatar
              avatar={initialAvatar}
              className={initialClass}
              classNameWrapper="h-48 w-36 rounded-2xl border border-[#3d3c4c] shadow-2xl"
            />
          )}
        </div>

        <h1 className="max-w-xl text-3xl font-bold leading-tight text-[#f4f4f8] sm:text-4xl">
          {hasExistingSave && existingHeroName
            ? `Welcome back, ${existingHeroName}.`
            : 'Every legend starts with one small step.'}
        </h1>
        <p className="mt-3 max-w-md text-base font-medium text-[#9c9cb0]">
          Forge habits. Fight darkness. Build your guild.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {hasExistingSave ? (
            <button
              type="button"
              onClick={onContinueExisting}
              className="min-h-[48px] rounded-xl bg-[#9b7bf0] px-8 py-3 text-sm font-bold text-[#14111c] shadow-lg shadow-[#9b7bf0]/20 transition-colors hover:bg-[#b094f7] whitespace-nowrap"
            >
              Start Adventure
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(0);
                onStartNew();
              }}
              className="min-h-[48px] rounded-xl bg-[#9b7bf0] px-8 py-3 text-sm font-bold text-[#14111c] transition-colors hover:bg-[#b094f7] whitespace-nowrap"
            >
              Begin Your Journey
            </button>
          )}
        </div>

        <p className="mt-12 text-xs text-[#767687]">
          Offline single-player · Private browser save · JSON backup included
        </p>
      </div>
    );
  }

  const canProceed = dialogDone && (step !== 0 || heroName.trim().length > 0);

  return (
    <div className="mx-auto min-h-dvh max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-center justify-between border-b border-[#2e2d38] pb-4">
        <span className="text-lg font-bold tracking-[0.18em] text-[#f4f4f8]">ARCANA</span>
        <span className="text-xs font-bold text-[#a2a2b3]">
          Chapter {step + 1} of 3 · Character Creation
        </span>
      </header>

      {step !== 1 && (
        <div className="mx-auto mb-8 grid max-w-3xl grid-cols-1 items-end gap-5 sm:grid-cols-[160px_1fr]">
          <MerlinAvatar
            speaking={!dialogDone}
            classNameWrapper="mx-auto aspect-[3/4] w-36 rounded-2xl border border-[#4a4563] shadow-xl sm:mx-0"
          />
          <div className="flex min-h-[164px] flex-col justify-between rounded-2xl border border-[#6e5d46] bg-[#2a231c] p-5 shadow-xl">
            <div>
              <p className="text-xs font-bold tracking-wider text-[#e8b84b]">
                Merlin · Keeper of Arcana
              </p>
              <p className="mt-2.5 text-base leading-relaxed text-[#fff7e7]">{typedText}</p>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setTypedText(DIALOGUES[step]);
                  setDialogDone(true);
                }}
                className={`text-xs font-bold text-[#d6c29d] underline-offset-4 hover:underline ${
                  dialogDone ? 'invisible' : ''
                }`}
              >
                Skip dialogue
              </button>
              <button
                type="button"
                disabled={!canProceed}
                onClick={() => {
                  if (step < 2) {
                    setStep(step + 1);
                  } else {
                    onComplete(heroName.trim() || 'Adventurer', avatar, selectedClass);
                  }
                }}
                className="min-h-[42px] rounded-xl bg-[#9b7bf0] px-5 py-2 text-sm font-bold text-[#14111c] transition-colors hover:bg-[#b094f7] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
              >
                {step === 2 ? 'Enter the Realm' : 'Continue'} ›
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 0 && (
        <div className="mx-auto max-w-xl rounded-2xl border border-[#343340] bg-[#222229] p-6">
          <label htmlFor="hero-name-input" className="block text-sm font-bold text-[#f4f4f8]">
            Your Hero Name
          </label>
          <input
            id="hero-name-input"
            type="text"
            maxLength={24}
            value={heroName}
            onChange={(e) => setHeroName(e.target.value)}
            placeholder="Write your adventurer name"
            autoComplete="off"
            className="mt-2.5 min-h-[46px] w-full rounded-xl border border-[#3d3c4c] bg-[#18181c] px-4 py-2.5 text-base text-[#f4f4f8] placeholder:text-[#767687] focus:border-[#9b7bf0] focus:outline-none"
          />
          <p className="mt-2.5 text-xs text-[#a2a2b3]">
            Enter a name to unlock the next chapter. You can revisit Merlin anytime from Settings.
          </p>
        </div>
      )}

      {step === 1 && (
        <AvatarWorkshop
          avatar={avatar}
          className={selectedClass}
          onChange={setAvatar}
          merlinSection={
            <div className="relative rounded-2xl border border-[#3a3548] bg-[#1b1922] p-4 shadow-xl">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded bg-[#c96f0e] px-2.5 py-0.5 text-[11px] font-extrabold text-white">
                  <span className="text-[#fde047]">◆</span>
                  Merlin
                  <span className="text-[#fde047]">◆</span>
                </span>
                <MerlinAvatar
                  speaking={!dialogDone}
                  includeBackground={false}
                  classNameWrapper="-mt-8 h-12 w-10 shrink-0"
                />
              </div>
              <p className="text-sm leading-relaxed text-[#ece9f5]">{typedText}</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTypedText(DIALOGUES[step]);
                    setDialogDone(true);
                  }}
                  className={`text-xs font-bold text-[#b8abdb] underline-offset-4 hover:underline ${
                    dialogDone ? 'invisible' : ''
                  }`}
                >
                  Skip dialogue
                </button>
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={() => setStep(2)}
                  className="min-h-[38px] rounded-xl bg-[#9b7bf0] px-4 py-1.5 text-xs font-bold text-[#14111c] transition-colors hover:bg-[#b094f7] disabled:cursor-not-allowed disabled:opacity-40 whitespace-nowrap"
                >
                  Continue ›
                </button>
              </div>
            </div>
          }
        />
      )}

      {step === 2 && (
        <div>
          <div className="mb-5 text-center">
            <h2 className="text-2xl font-bold text-[#f4f4f8]">Choose Your Combat Class</h2>
            <p className="mt-1 text-sm text-[#a2a2b3]">
              These previews show class armor; your customized hair, face, and unlocked gear always remain yours.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
            {CLASSES.map((c) => {
              const active = selectedClass === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedClass(c)}
                  style={{ borderColor: active ? CLASS_COLORS[c] : undefined }}
                  className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                    active
                      ? 'bg-[#2b2838] ring-1 ring-inset'
                      : 'border-[#343340] bg-[#222229] hover:bg-[#2a2933]'
                  }`}
                >
                  <span
                    className="grid h-11 w-11 place-items-center rounded-xl border text-2xl"
                    style={{
                      color: CLASS_COLORS[c],
                      borderColor: `${CLASS_COLORS[c]}66`,
                    }}
                  >
                    {CLASS_GLYPHS[c]}
                  </span>
                  <span className="mt-2.5 text-base font-bold" style={{ color: CLASS_COLORS[c] }}>
                    {c}
                  </span>
                  <p className="mt-1.5 min-h-[48px] text-xs leading-relaxed text-[#a2a2b3]">
                    {CLASS_DESCRIPTIONS[c]}
                  </p>
                  <HeroAvatar
                    avatar={avatar}
                    className={c}
                    showClassPreview
                    classNameWrapper="mt-3 aspect-[3/4] w-28 rounded-xl border border-[#3a3947]"
                  />
                  <span className="mt-3 text-xs font-bold text-[#e0def0]">
                    {active ? 'Selected Path' : 'Choose Class'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            if (step > 0) setStep(step - 1);
            else onBackToStart();
          }}
          className="min-h-[42px] rounded-xl px-4 py-2 text-sm font-bold text-[#a2a2b3] hover:bg-[#222229] hover:text-[#f4f4f8]"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          {[0, 1, 2].map((n) => (
            <span
              key={n}
              className={`h-2 w-2 rounded-full transition-colors ${
                n === step ? 'bg-[#9b7bf0]' : 'bg-[#3d3c4c]'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
