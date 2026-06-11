/* Password gate — hashed (FNV-1a + base36) password in localStorage */

const { useState: useStateAu, useEffect: useEffectAu } = React;

const STORE_KEY = "ops_visits_auth_v1";
// Default password: "letmein" → hash. Change after first login from console:
//   localStorage.setItem("ops_visits_auth_v1", JSON.stringify({ hash: hash("yourpw") }))
const DEFAULT_HASH = h("letmein");

function h(s) {
  // FNV-1a 32-bit then mix in length to widen
  let hash = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // mix
  let h2 = 0x9e3779b9;
  for (let i = 0; i < s.length; i++) {
    h2 = Math.imul(h2 + s.charCodeAt(i), 0x85ebca6b);
    h2 ^= h2 >>> 13;
  }
  return ((hash >>> 0).toString(36)) + "_" + ((h2 >>> 0).toString(36)) + "_" + s.length.toString(36);
}

function AuthGate({ children }) {
  const [authed, setAuthed] = useStateAu(false);
  const [pw, setPw] = useStateAu("");
  const [err, setErr] = useStateAu("");
  const [tries, setTries] = useStateAu(0);

  useEffectAu(() => {
    const stored = sessionStorage.getItem(STORE_KEY + "_session");
    if (stored === "ok") setAuthed(true);
  }, []);

  function submit(e) {
    e.preventDefault();
    if (tries >= 5) { setErr("Locked. Refresh after a coffee."); return; }
    const stored = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    const targetHash = stored?.hash || DEFAULT_HASH;
    if (h(pw) === targetHash) {
      sessionStorage.setItem(STORE_KEY + "_session", "ok");
      setAuthed(true);
      setErr("");
    } else {
      setTries(t => t + 1);
      setErr(`Wrong. ${5 - tries - 1} attempts left.`);
      setPw("");
    }
  }

  if (authed) return children;

  return (
    <div className="gate-wrap">
      <form className="gate" onSubmit={submit}>
        <div className="head">
          <span className="pulse" />
          /admin/visits · restricted
        </div>
        <h1>Who's there?</h1>
        <p>This dashboard is private. Authorized access only — outreach signals, lead heat scores, and session-level visitor data live here.</p>
        <input
          type="password"
          placeholder="passphrase"
          value={pw}
          onChange={e => setPw(e.target.value)}
          autoFocus
        />
        {err && <div className="err">{err}</div>}
        <div className="actions">
          <button className="submit" type="submit">Unlock →</button>
          <span className="hint">demo: <code>letmein</code></span>
        </div>
      </form>
    </div>
  );
}

window.AuthGate = AuthGate;
