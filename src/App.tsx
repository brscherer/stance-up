import { useState } from 'react';

function App() {
  const [cameraRequested, setCameraRequested] = useState(false);

  return (
    <main className="app-shell">
      <section className="hero-card" aria-labelledby="app-title">
        <p className="eyebrow">Muay Thai stance coach</p>
        <h1 id="app-title">Stance Up</h1>
        <p className="lede">
          Use your camera locally to check stance fundamentals and get clear cues for your next round.
        </p>
        <button type="button" onClick={() => setCameraRequested(true)}>
          Start camera setup
        </button>
        {cameraRequested ? (
          <p role="status" className="status-note">
            Camera integration is the next deliverable. For now, the app shell is ready.
          </p>
        ) : null}
      </section>
    </main>
  );
}

export default App;
