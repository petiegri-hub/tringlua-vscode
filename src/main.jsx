import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowLeft, ArrowRight, BookOpen, ChartColumn, Check, ChevronRight,
  ClipboardList, Flame, House, Layers, Search, Settings, Target
} from 'lucide-react';
import './style.css';

const nav = [
  ['home', 'Kezdőlap', House],
  ['learn', 'Tanulás', BookOpen],
  ['practice', 'Gyakorlás', Target],
  ['test', 'Teszt', ClipboardList],
  ['cards', 'Szókártyák', Layers],
  ['dictionary', 'Szókincs', Search],
  ['stats', 'Statisztika', ChartColumn],
  ['settings', 'Beállítások', Settings]
];

function shuffled(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function App() {
  const [vocab, setVocab] = useState([]);
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [view, setView] = useState('home');
  const [level, setLevel] = useState('A1');
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState(() => Number(localStorage.getItem('tl-known') || 0));
  const [query, setQuery] = useState('');
  const [practice, setPractice] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [test, setTest] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${import.meta.env.BASE_URL}vocab.json`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error(`Szókincs letöltése sikertelen (${response.status}).`);
        return response.json();
      })
      .then(words => {
        if (!Array.isArray(words) || words.length !== 5000) {
          throw new Error('A szókincs adatfájlja nem tartalmazza mind az 5 000 bejegyzést.');
        }
        setVocab(words);
        setLoadError('');
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error('Nem sikerült betölteni a német–magyar szókincset.', error);
        setLoadError('A szókincs betöltése nem sikerült. Ellenőrizd a kapcsolatot, majd próbáld újra.');
      });
    return () => controller.abort();
  }, [loadAttempt]);

  const list = useMemo(() => vocab.filter(word => word.level === level), [level]);
  const word = list[idx % Math.max(list.length, 1)] || vocab[0];
  const filteredWords = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('hu');
    if (!term) return vocab;
    return vocab.filter(item => [
      item.de,
      item.hu,
      ...item.alternatives,
      item.ex.de,
      item.ex.hu
    ].some(value => value.toLocaleLowerCase('hu').includes(term)));
  }, [query]);

  function makeQuestion(pool = list) {
    const correct = pool[Math.floor(Math.random() * pool.length)];
    const distractors = shuffled(vocab.filter(item => item !== correct)).slice(0, 3);
    return { word: correct, options: shuffled([correct, ...distractors]) };
  }

  function switchView(nextView) {
    setView(nextView);
    setFeedback('');
    if (nextView === 'practice') setPractice(makeQuestion());
    if (nextView === 'test') setTest(null);
  }

  function next() {
    setIdx(index => (index + 1) % Math.max(list.length, 1));
    setFlip(false);
  }

  function newPractice() {
    setPractice(makeQuestion());
    setFeedback('');
  }

  function answer(option) {
    setFeedback(option === practice.word ? '✓ Helyes!' : `✗ Helyes válasz: ${practice.word.hu}`);
  }

  function mark() {
    const count = known + 1;
    setKnown(count);
    localStorage.setItem('tl-known', String(count));
    next();
  }

  function startTest() {
    setTest({ n: 0, score: 0, question: makeQuestion(vocab) });
  }

  function testAnswer(option) {
    const n = test.n + 1;
    const score = test.score + (option === test.question.word ? 1 : 0);
    if (n === 10) setTest({ n, score, done: true });
    else setTest({ n, score, question: makeQuestion(vocab) });
  }

  if (loadError) {
    return <main className="panel center"><h1>Nem sikerült betölteni a szókincset</h1><p>{loadError}</p><button className="btn" onClick={() => setLoadAttempt(attempt => attempt + 1)}>Újrapróbálom</button></main>;
  }
  if (!vocab.length) return <main className="panel center"><p>Az 5 000 német–magyar szópár betöltése…</p></main>;

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">◉ <span>TriLingua</span><small>Német · Magyar</small></div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button className={view === id ? 'active' : ''} onClick={() => switchView(id)} key={id}>
              <Icon size={19} />{label}
            </button>
          ))}
        </nav>
        <div className="sidebottom">🌱 Minden nap egy új szó!</div>
      </aside>

      <main>
        <header className="top">
          <div>
            <h1>{view === 'home' ? 'Szia! 👋' : nav.find(item => item[0] === view)?.[1]}</h1>
            <p>Tanulj német szavakat magyar fordításokkal és példamondatokkal.</p>
          </div>
          <span className="streak"><Flame size={18} /> {vocab.length.toLocaleString('hu')} szópár</span>
        </header>

        <section className="panel controls">
          <div className="language-pair"><span>Tanulási irány</span><strong>🇩🇪 Német → 🇭🇺 Magyar</strong></div>
          <div>
            <b>Szint</b>
            <div className="levels">
              {['A1', 'A2', 'B1', 'B2'].map(item => (
                <button className={level === item ? 'selected' : ''} onClick={() => { setLevel(item); setIdx(0); }} key={item}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <span className="muted push">5 000 német–magyar bejegyzés</span>
        </section>

        {view === 'home' && (
          <>
            <div className="hero">
              <section className="panel purple">
                <h2>{level} szint – Haladásod</h2>
                <div className="bar"><i style={{ width: `${Math.min(100, (known / vocab.length) * 100)}%` }} /></div>
                <div className="statsrow">
                  <span>📖 {known} megjelölt szó</span>
                  <span>📚 {vocab.length.toLocaleString('hu')} szópár</span>
                  <span>🎯 4 tanulási szint</span>
                </div>
                <section className="panel goal">
                  <h3>🎯 Szótanulási haladás</h3>
                  Jelöld meg az ismert szavakat tanulás közben.
                  <div className="bar"><i style={{ width: `${Math.min(100, (known / vocab.length) * 100)}%` }} /></div>
                  <b>{Math.min(known, vocab.length)} / {vocab.length.toLocaleString('hu')} szó</b>
                </section>
              </section>
            </div>
            <h2 className="sectiontitle">Mit szeretnél ma csinálni?</h2>
            <div className="actions">
              {[
                ['learn', '📖', 'Új szavak tanulása', 'Német szavak magyar fordítással.'],
                ['practice', '🔄', 'Gyakorlás', 'Válaszd ki a helyes magyar jelentést.'],
                ['test', '📝', 'Teszt', '10 kérdéses német–magyar teszt.'],
                ['cards', '🗂️', 'Szókártyák', 'Ismételd a szavakat példamondatokkal.']
              ].map(([destination, emoji, title, description]) => (
                <article className="action" key={destination}>
                  <span>{emoji}</span><h3>{title}</h3><p>{description}</p>
                  <button className="btn" onClick={() => switchView(destination)}>Megnyitás <ChevronRight size={16} /></button>
                </article>
              ))}
            </div>
            <div className="panel tablepanel">
              <h3>Példa a mai leckéből – {level}</h3>
              <WordsTable rows={list.slice(0, 5)} />
            </div>
          </>
        )}

        {view === 'learn' && (
          <section className="panel center">
            <h2>📖 Német szavak tanulása</h2>
            <p className="muted">{word.topic} · {word.level} · {idx + 1}/{list.length}</p>
            <div className="bigword">{word.de}</div>
            <div className="translation">{word.hu}</div>
            {word.alternatives.length > 0 && <p className="muted">További jelentések: {word.alternatives.join('; ')}</p>}
            <Example word={word} />
            <button className="btn ghost" onClick={() => setIdx(index => Math.max(0, index - 1))}><ArrowLeft /> Előző</button>{' '}
            <button className="btn" onClick={next}>Következő <ArrowRight /></button>{' '}
            <button className="btn green" onClick={mark}><Check /> Ismerem</button>
          </section>
        )}

        {view === 'practice' && (
          <section className="panel center">
            <h2>🔄 Gyakorlás</h2>
            <p>Válaszd ki a német szó magyar fordítását!</p>
            {practice && (
              <>
                <div className="bigword">{practice.word.de}</div>
                <div className="choices">
                  {practice.options.map(option => <button key={option.de} onClick={() => answer(option)}>{option.hu}</button>)}
                </div>
                <p className="feedback">{feedback}</p>
                <button className="btn" onClick={newPractice}>Új kérdés ↻</button>
              </>
            )}
          </section>
        )}

        {view === 'test' && (
          <section className="panel center">
            <h2>📝 Német–magyar szintfelmérő</h2>
            {!test ? (
              <><p>10 kérdéses teszt – válaszd ki a német szó magyar fordítását.</p><button className="btn" onClick={startTest}>Teszt indítása</button></>
            ) : test.done ? (
              <><div className="bigword">{test.score}/10</div><p>{test.score >= 8 ? 'Nagyszerű eredmény!' : 'Gyakorolj még egy kicsit, és próbáld újra!'}</p><button className="btn" onClick={startTest}>Új teszt</button></>
            ) : (
              <><p>{test.n + 1}/10 kérdés</p><div className="bigword">{test.question.word.de}</div>
                <div className="choices">
                  {test.question.options.map(option => <button key={option.de} onClick={() => testAnswer(option)}>{option.hu}</button>)}
                </div>
              </>
            )}
          </section>
        )}

        {view === 'cards' && (
          <section className="panel center">
            <h2>🗂️ Német–magyar szókártyák</h2>
            <p className="muted">Kattints a kártyára a fordításhoz.</p>
            <div className="flash" onClick={() => setFlip(value => !value)}>
              {flip ? <><div className="translation">{word.hu}</div><Example word={word} /></> : <div className="bigword">{word.de}</div>}
              <small> • Kattints a fordításhoz • </small>
            </div>
            <button className="btn" onClick={next}>Következő kártya →</button>
          </section>
        )}

        {view === 'dictionary' && (
          <section className="panel">
            <h2>🔎 Német–magyar szókincs</h2>
            <div className="search">
              <Search />
              <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Keress német vagy magyar szóra…" />
            </div>
            <p className="muted">{filteredWords.length.toLocaleString('hu')} találat · legfeljebb 100 sor jelenik meg</p>
            <WordsTable rows={filteredWords.slice(0, 100)} />
          </section>
        )}

        {view === 'stats' && (
          <section className="panel">
            <h2>📊 Tanulási statisztika</h2>
            <div className="statsrow">
              <b>📖 {known} megjelölt szó</b>
              <b>📚 {vocab.length.toLocaleString('hu')} szópár</b>
              <b>🎯 4 tanulási szint</b>
            </div>
            <p>A megjelölt szavak száma a böngésző helyi tárhelyén tárolódik.</p>
          </section>
        )}

        {view === 'settings' && (
          <section className="panel">
            <h2>⚙️ Beállítások</h2>
            <p>A tanulási irány rögzített: német → magyar. Válassz szintet a fenti vezérlőkkel.</p>
            <button className="btn ghost" onClick={() => { localStorage.removeItem('tl-known'); setKnown(0); }}>Haladás törlése</button>
          </section>
        )}

        <footer>TriLingua · Német–magyar szókincs · A haladás ezen az eszközön tárolódik.</footer>
      </main>
    </div>
  );
}

function Example({ word }) {
  return (
    <div className="example">
      <b>Példamondat</b>
      <p>{word.ex.de}</p>
      <small>{word.ex.hu}</small>
      <small className="example-source">
        Forrás: <a href={word.exampleSource[0]} target="_blank" rel="noreferrer">Tatoeba (német)</a>
        {' · '}
        <a href={word.exampleSource[1]} target="_blank" rel="noreferrer">Tatoeba (magyar)</a>
        {' · '}
        <a href={word.source} target="_blank" rel="noreferrer">Wiktionary</a>
      </small>
    </div>
  );
}

function WordsTable({ rows }) {
  return (
    <div className="tablewrap">
      <table>
        <thead><tr><th>Német</th><th>Magyar</th><th>Szint</th><th>Szófaj</th><th>Példamondat (DE / HU)</th></tr></thead>
        <tbody>
          {rows.map(item => (
            <tr key={item.de}>
              <td>{item.de}</td>
              <td>{item.hu}{item.alternatives.length > 0 && <small>{item.alternatives.join('; ')}</small>}</td>
              <td><span className="badge">{item.level}</span></td>
              <td>{item.topic}</td>
              <td>{item.ex.de}<small>{item.ex.hu}</small><small><a href={item.exampleSource[0]} target="_blank" rel="noreferrer">Tatoeba (DE)</a>{' · '}<a href={item.exampleSource[1]} target="_blank" rel="noreferrer">Tatoeba (HU)</a></small></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan="5">Nincs találat.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
