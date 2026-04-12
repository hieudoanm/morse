'use client';

import { NextPage } from 'next';
import { useState, useCallback, useRef } from 'react';

// ── MORSE MAP ────────────────────────────────────────────────────────────────

const morse: Record<string, { code: string; pattern: string }> = {
  a: { code: '.-', pattern: 'di-dah' },
  b: { code: '-...', pattern: 'dah-di-di-dit' },
  c: { code: '-.-.', pattern: 'dah-di-dah-dit' },
  d: { code: '-..', pattern: 'dah-di-dit' },
  e: { code: '.', pattern: 'dit' },
  f: { code: '..-.', pattern: 'di-di-dah-dit' },
  g: { code: '--.', pattern: 'dah-dah-dit' },
  h: { code: '....', pattern: 'di-di-di-dit' },
  i: { code: '..', pattern: 'di-dit' },
  j: { code: '.---', pattern: 'di-dah-dah-dah' },
  k: { code: '-.-', pattern: 'dah-di-dah' },
  l: { code: '.-..', pattern: 'di-dah-di-dit' },
  m: { code: '--', pattern: 'dah-dah' },
  n: { code: '-.', pattern: 'dah-dit' },
  o: { code: '---', pattern: 'dah-dah-dah' },
  p: { code: '.--.', pattern: 'di-dah-dah-dit' },
  q: { code: '--.-', pattern: 'dah-dah-di-dah' },
  r: { code: '.-.', pattern: 'di-dah-dit' },
  s: { code: '...', pattern: 'di-di-dit' },
  t: { code: '-', pattern: 'dah' },
  u: { code: '..-', pattern: 'di-di-dah' },
  v: { code: '...-', pattern: 'di-di-di-dah' },
  w: { code: '.--', pattern: 'di-dah-dah' },
  x: { code: '-..-', pattern: 'dah-di-di-dah' },
  y: { code: '-.--', pattern: 'dah-di-dah-dah' },
  z: { code: '--..', pattern: 'dah-dah-di-dit' },
  '1': { code: '.----', pattern: 'di-dah-dah-dah-dah' },
  '2': { code: '..---', pattern: 'di-di-dah-dah-dah' },
  '3': { code: '...--', pattern: 'di-di-di-dah-dah' },
  '4': { code: '....-', pattern: 'di-di-di-di-dah' },
  '5': { code: '.....', pattern: 'di-di-di-di-dit' },
  '6': { code: '-....', pattern: 'dah-di-di-di-dit' },
  '7': { code: '--...', pattern: 'dah-dah-di-di-dit' },
  '8': { code: '---..', pattern: 'dah-dah-dah-di-dit' },
  '9': { code: '----.', pattern: 'dah-dah-dah-dah-dit' },
  '0': { code: '-----', pattern: 'dah-dah-dah-dah-dah' },
  '.': { code: '.-.-.-', pattern: 'di-dah-di-dah-di-dah' },
  ',': { code: '--..--', pattern: 'dah-dah-di-di-dah-dah' },
  '?': { code: '..--..', pattern: 'di-di-dah-dah-di-dit' },
  "'": { code: '.----.', pattern: 'di-dah-dah-dah-dah-dit' },
  '!': { code: '-.-.--', pattern: 'dah-di-dah-di-dah-dah' },
  '/': { code: '-..-.', pattern: 'dah-di-di-dah-dit' },
  '(': { code: '-.--.', pattern: 'dah-di-dah-dah-dit' },
  ')': { code: '-.--.-', pattern: 'dah-di-dah-dah-di-dah' },
  '&': { code: '.-...', pattern: 'di-dah-di-di-dit' },
  ':': { code: '---...', pattern: 'dah-dah-dah-di-di-dit' },
  ';': { code: '-.-.-.', pattern: 'dah-di-dah-di-dah-dit' },
  '=': { code: '-...-', pattern: 'dah-di-di-di-dah' },
  '+': { code: '.-.-.', pattern: 'di-dah-di-dah-dit' },
  '-': { code: '-....-', pattern: 'dah-di-di-di-di-dah' },
  _: { code: '..--.-', pattern: 'di-di-dah-dah-di-dah' },
  '"': { code: '.-..-.', pattern: 'di-dah-di-di-dah-dit' },
  '@': { code: '.--.-.', pattern: 'di-dah-dah-di-dah-dit' },
  ' ': { code: '/', pattern: 'word-space' },
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

export const morsify = (text: string): string =>
  text
    .split('')
    .map((ch) => {
      const map = morse[ch.toLowerCase()];
      return map ? map.code : '';
    })
    .filter(Boolean)
    .join(' ');

const downloadMorse = (text: string, filename = 'output.morse') => {
  const morseText = morsify(text);
  const blob = new Blob([morseText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// Audio playback
const playMorse = (text: string) => {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const ctx = new AudioCtx();
  const unit = 0.08; // seconds per unit
  const freq = 600; // Hz

  const morseStr = morsify(text);
  let time = ctx.currentTime + 0.1;

  const beep = (duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.4, time);
    osc.start(time);
    osc.stop(time + duration);
    time += duration;
  };

  const silence = (duration: number) => {
    time += duration;
  };

  for (const ch of morseStr) {
    if (ch === '.') {
      beep(unit);
      silence(unit); // intra-character gap
    } else if (ch === '-') {
      beep(unit * 3);
      silence(unit);
    } else if (ch === ' ') {
      silence(unit * 3); // inter-character gap (already have 1u from last symbol)
    } else if (ch === '/') {
      silence(unit * 7); // word gap
    }
  }
};

// ── PAGE ─────────────────────────────────────────────────────────────────────

const AppPage: NextPage = () => {
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [playing, setPlaying] = useState(false);

  const output = morsify(input);
  const charCount = input.length;
  const symbolCount = output.replace(/ /g, '').replace(/\//g, '').length;

  const copy = useCallback(async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [output]);

  const handlePlay = useCallback(() => {
    if (!input || playing) return;
    setPlaying(true);
    playMorse(input);
    // Estimate playback duration: ~0.08s per symbol + gaps
    const morseStr = morsify(input);
    const unit = 0.08;
    const duration =
      morseStr.split('').reduce((acc, ch) => {
        if (ch === '.') return acc + unit * 2;
        if (ch === '-') return acc + unit * 4;
        if (ch === ' ') return acc + unit * 3;
        if (ch === '/') return acc + unit * 7;
        return acc;
      }, 0) * 1000;
    setTimeout(() => setPlaying(false), duration + 300);
  }, [input, playing]);

  return (
    <div
      className="bg-base-100 text-base-content relative min-h-screen px-6 py-20 md:px-12"
      data-theme="luxury">
      {/* Ambient glow */}
      <div className="bg-primary/5 pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-primary mb-7 text-xs tracking-[0.2em] uppercase">
            Telegraphy · ITU Morse Code · Audio Playback
          </p>
          <h1 className="mb-6 font-serif text-6xl leading-[1.05] font-black tracking-tight md:text-7xl">
            Text to <span className="text-primary">Morse</span>
          </h1>
          <p className="text-base-content/60 mx-auto max-w-md text-base leading-relaxed">
            Convert any text to standard ITU Morse Code. Play it back as audio,
            copy the symbols, or download as a{' '}
            <span className="font-mono text-sm">.morse</span> file.
          </p>
        </div>

        {/* Editor grid */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Input card */}
          <div className="card bg-base-200 border-base-300 border">
            <div className="card-body p-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-base-content/50 text-xs tracking-[0.14em] uppercase">
                  Input
                </p>
                <span className="badge badge-ghost border-base-300 border font-mono text-xs">
                  {charCount} chars
                </span>
              </div>
              <textarea
                className="textarea textarea-bordered h-48 w-full resize-none font-sans text-sm leading-relaxed"
                placeholder="Type or paste your text here…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {['Hello world', 'SOS', 'CQ CQ DE'].map((sample) => (
                  <button
                    key={sample}
                    className="btn btn-ghost btn-xs border-base-300 border"
                    onClick={() => setInput(sample)}>
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Output card */}
          <div className="card bg-base-200 border-base-300 border">
            <div className="card-body p-7">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-base-content/50 text-xs tracking-[0.14em] uppercase">
                  Morse output
                </p>
                <span className="badge badge-ghost border-base-300 border font-mono text-xs">
                  {symbolCount} symbols
                </span>
              </div>
              <div className="bg-base-300 border-base-content/10 h-48 overflow-auto rounded-xl border p-4">
                {output ? (
                  <p className="text-primary font-mono text-lg leading-loose tracking-widest break-all">
                    {output}
                  </p>
                ) : (
                  <p className="text-base-content/20 text-sm">
                    Morse output will appear here…
                  </p>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${playing ? 'btn-warning' : 'btn-primary'}`}
                  onClick={handlePlay}
                  disabled={!output || playing}>
                  {playing ? '▶ Playing…' : '▶ Play Audio'}
                </button>
                <button
                  className={`btn btn-sm ${copied ? 'btn-success' : 'btn-ghost border-base-300 border'}`}
                  onClick={copy}
                  disabled={!output}>
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
                <button
                  className="btn btn-ghost btn-sm border-base-300 border"
                  onClick={() => downloadMorse(input)}
                  disabled={!input}>
                  ↓ Download .morse
                </button>
                <button
                  className="btn btn-ghost btn-sm border-base-300 border"
                  onClick={() => setInput('')}
                  disabled={!input}>
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Character reference table */}
        {input && (
          <div className="mt-5">
            <div className="card bg-base-200 border-base-300 border">
              <div className="card-body p-7">
                <p className="text-base-content/50 mb-4 text-xs tracking-[0.14em] uppercase">
                  Character map
                </p>
                <div className="border-base-300 overflow-hidden rounded-xl border">
                  <table className="table-sm table w-full text-sm">
                    <thead className="bg-base-300 text-base-content/40 text-xs tracking-wider uppercase">
                      <tr>
                        <th>Input</th>
                        <th>Morse</th>
                        <th>Pattern</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from(new Set(input.toLowerCase().split('')))
                        .filter((ch) => morse[ch])
                        .map((ch) => {
                          const entry = morse[ch];
                          return (
                            <tr
                              key={ch}
                              className="border-base-300 hover:bg-base-content/[0.02] border-t">
                              <td className="font-mono font-medium uppercase">
                                {ch === ' ' ? '␣' : ch}
                              </td>
                              <td className="text-primary font-mono text-base tracking-widest">
                                {entry.code}
                              </td>
                              <td className="text-base-content/40 font-mono text-xs">
                                {entry.pattern}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <span className="badge badge-success gap-1">● ITU Standard</span>
          <span className="badge badge-info">Web Audio API</span>
          <span className="badge badge-neutral">.morse Export</span>
          <span className="badge badge-ghost border-base-300 border">
            A–Z · 0–9 · Punctuation
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppPage;
