import { useState, useEffect, useRef, useCallback } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Nunito+Sans:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
);

// ─── Design Tokens ────────────────────────────────────────────────────────────
const T = {
  brand:      "#5B4FCF",
  brandDark:  "#4338A8",
  brandLight: "#7B6FE8",
  brandPale:  "#EAE8FF",
  bg:         "#F4F5FB",
  white:      "#FFFFFF",
  text:       "#1A1A2E",
  textSoft:   "#5A5A7A",
  textMuted:  "#9898B3",
  border:     "#E2E2F0",
  green:      "#27AE60",
  red:        "#E53935",
  amber:      "#F59E0B",
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root {
      height: 100%;
      overflow: hidden;
      background: ${T.bg};
      font-family: 'Nunito Sans', sans-serif;
      color: ${T.text};
      -webkit-font-smoothing: antialiased;
    }
    input::placeholder { color: ${T.textMuted}; }
    input:focus { outline: none; }
    button:focus { outline: none; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 2px; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes blinkDot {
      0%,100% { opacity: 1; }
      50%     { opacity: 0.2; }
    }
    @keyframes toastUp {
      from { transform: translateX(-50%) translateY(80px); opacity: 0; }
      to   { transform: translateX(-50%) translateY(0);   opacity: 1; }
    }
    .fade-in { animation: fadeUp 0.35s ease; }
    .blink   { animation: blinkDot 1.4s infinite; }
  `}</style>
);

// ─── Data ─────────────────────────────────────────────────────────────────────
const PROFS = [
  { id:"p01", name:"Dr. Rajesh Kumar",         subj:"Artificial Intelligence", status:"online",  rating:4.9, sessions:234, initials:"RK", color:"#5B4FCF,#7B6FE8", tag:"AI"    },
  { id:"p02", name:"Dr. Priya Sharma",          subj:"Machine Learning",        status:"online",  rating:4.8, sessions:189, initials:"PS", color:"#7C3AED,#A78BFA", tag:"ML"    },
  { id:"p03", name:"Dr. Arun Venkat",            subj:"Data Science",            status:"online",  rating:4.7, sessions:156, initials:"AV", color:"#0891B2,#22D3EE", tag:"Data"  },
  { id:"p04", name:"Dr. Kavitha Nair",           subj:"Cloud Computing",         status:"busy",    rating:4.9, sessions:312, initials:"KN", color:"#D97706,#FCD34D", tag:"Cloud" },
  { id:"p05", name:"Dr. Senthil Rajan",          subj:"Cybersecurity",           status:"online",  rating:4.6, sessions:98,  initials:"SR", color:"#059669,#34D399", tag:"Data"  },
  { id:"p06", name:"Dr. Meena Iyer",             subj:"Web Development",         status:"online",  rating:4.8, sessions:201, initials:"MI", color:"#DB2777,#F472B6", tag:"Web"   },
  { id:"p07", name:"Dr. Vikram Pillai",          subj:"DevOps",                  status:"offline", rating:4.5, sessions:77,  initials:"VP", color:"#475569,#94A3B8", tag:"Cloud" },
  { id:"p08", name:"Dr. Deepa Pandian",          subj:"Blockchain",              status:"online",  rating:4.7, sessions:143, initials:"DP", color:"#EA580C,#FB923C", tag:"Data"  },
  { id:"p09", name:"Dr. Balaji Murugan",         subj:"IoT",                     status:"online",  rating:4.6, sessions:112, initials:"BM", color:"#0D9488,#2DD4BF", tag:"Cloud" },
  { id:"p10", name:"Dr. Saranya Krishnamurthy",  subj:"Python Programming",      status:"offline", rating:4.8, sessions:267, initials:"SK", color:"#475569,#94A3B8", tag:"ML"   },
  { id:"p11", name:"Dr. Ganesh Subramanian",    subj:"Java Programming",        status:"online",  rating:4.5, sessions:88,  initials:"GS", color:"#DC2626,#F87171", tag:"Web"   },
  { id:"p12", name:"Dr. Nithya Annamalai",      subj:"Database Management",     status:"busy",    rating:4.9, sessions:198, initials:"NA", color:"#9333EA,#C084FC", tag:"Data"  },
];

// HARDCODED USERS FOR LOGIN
const USERS = {
  student: { username: 'karthick', password: 'student123', role: 'student' },
  professor: { username: 'rajesh', password: 'prof123', role: 'professor' }
};

// ─── Constants ───────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  online:  { color: T.white, bg: T.green },
  offline: { color: T.textMuted, bg: T.border },
  busy:    { color: T.white, bg: T.amber },
};

const FILTER_TAGS = ["All", "AI", "ML", "Data", "Cloud", "Web"];

const DAYS_SHORT = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const TIME_SLOTS = ["9:00 AM", "10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"];

// ─── AI via Node Backend + Ollama ─────────────────────────────────────────────

async function askClaudeAI(question) {

  try {

    const response = await fetch("http://localhost:5000/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question: question
      })
    });

    const data = await response.json();
    console.log("AI backend returned:", data);

    if (data.answer) {
      return data.answer;
    }

    // if the server gave something else useful, return it for debugging
    if (data.error) {
      return "(backend error) " + data.error;
    }

    return "AI could not generate an answer.";

  } catch (error) {

    console.error("AI Error:", error);

    return "AI service unavailable. Please check if the backend server is running.";

  }

}
// ─── Style helpers ────────────────────────────────────────────────────────────
const card = {
  background: T.white, borderRadius: 16, padding: 20,
  boxShadow: "0 2px 8px rgba(91,79,207,0.08)", border: `1px solid ${T.border}`,
};

const btn = {
  width: "100%", background: T.brand, border: "none", borderRadius: 50,
  padding: "15px", color: T.white, fontSize: 15, fontWeight: 700,
  fontFamily: "'Nunito', sans-serif", cursor: "pointer",
};

const btnRed = {
  ...btn, background: T.red,
};

const btnOutline = {
  ...btn, background: "transparent", border: `2px solid ${T.brand}`,
  color: T.brand, padding: "13px",
};

const btnSm = {
  background: T.brand, border: "none", borderRadius: 50, padding: "9px 20px",
  color: T.white, fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
  cursor: "pointer", whiteSpace: "nowrap",
};

const btnSmOutline = {
  background: "transparent", border: `1.5px solid ${T.brand}`, borderRadius: 50,
  padding: "8px 18px", color: T.brand, fontSize: 13, fontWeight: 700,
  fontFamily: "'Nunito', sans-serif", cursor: "pointer", whiteSpace: "nowrap",
};

const inputStyle = {
  width: "100%", background: T.bg, border: `1.5px solid ${T.border}`,
  borderRadius: 10, padding: "13px 16px", fontSize: 14, color: T.text,
  fontFamily: "'Nunito Sans', sans-serif", marginBottom: 14,
};

const sectionHead = {
  fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16,
  color: T.text, margin: "20px 0 12px",
};

// ─── Toast hook ───────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((msg, type = "info") => {
    clearTimeout(timer.current);
    setToast({ msg, type });
    timer.current = setTimeout(() => setToast(null), 2600);
  }, []);
  return [toast, show];
}

// ─── Toast UI ─────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  const bg = type === "success" ? T.green : type === "error" ? T.red : T.brand;
  return (
    <div style={{
      position: "fixed", bottom: 24, left: "50%",
      transform: "translateX(-50%)",
      background: bg, color: T.white,
      padding: "12px 24px", borderRadius: 50,
      fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif",
      zIndex: 9999, whiteSpace: "nowrap",
      boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      animation: "toastUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
    }}>{msg}</div>
  );
}

// ─── Shared components ────────────────────────────────────────────────────────

function Avatar({ initials, color, size = 46, border }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: `linear-gradient(135deg,${color})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Nunito', sans-serif", fontWeight: 800,
      fontSize: size > 60 ? 22 : size > 40 ? 14 : 12,
      color: T.white, flexShrink: 0,
      border: border ? `4px solid ${T.white}` : "none",
      boxShadow: border ? "0 4px 20px rgba(91,79,207,0.18)" : "none",
    }}>{initials}</div>
  );
}

function StatusPill({ status }) {
  const st = STATUS_STYLE[status] || STATUS_STYLE.offline;
  const labels = { online: "Online", offline: "Offline", busy: "Busy" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      fontSize: 11, fontWeight: 700, padding: "3px 10px",
      borderRadius: 20, color: st.color, background: st.bg,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
      {labels[status]}
    </span>
  );
}

function FocusInput({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      {label && (
        <label style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6, display: "block" }}>
          {label}
        </label>
      )}
      <input
        {...props}
        style={{
          ...inputStyle,
          borderColor: focused ? T.brand : T.border,
          boxShadow: focused ? "0 0 0 3px rgba(91,79,207,0.1)" : "none",
          background: focused ? T.white : T.bg,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// Wave header with rounded bottom
function WaveHeader({ title, subtitle }) {
  return (
    <div style={{ background: T.brand, position: "relative", padding: "24px 24px 64px", flexShrink: 0 }}>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 28, color: T.white, letterSpacing: "-0.5px" }}>Linko.</div>
      <div style={{ marginTop: 28 }}>
        <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 22, color: T.white }}>{title}</div>
        {subtitle && <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{subtitle}</div>}
      </div>
      <div style={{ position: "absolute", bottom: -1, left: 0, right: 0, height: 40, background: T.bg, borderRadius: "40px 40px 0 0" }} />
    </div>
  );
}

// Top navigation bar with optional back arrow
function Topbar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: T.white, borderBottom: `1px solid ${T.border}`, gap: 12, flexShrink: 0 }}>
      {onBack
        ? <button onClick={onBack} style={{ width: 36, height: 36, borderRadius: "50%", background: T.brandPale, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: T.brand, fontSize: 18, fontWeight: 700, flexShrink: 0 }}>&#8592;</button>
        : <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: T.brand, letterSpacing: "-0.5px" }}>Linko.</div>
      }
      {title && <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 17, color: T.text }}>{title}</div>}
      {right && <div style={{ marginLeft: "auto" }}>{right}</div>}
    </div>
  );
}

// Topbar with user avatar
function NavTopbar({ name, initial, onProfile }) {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", background: T.white, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
      <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 24, color: T.brand, letterSpacing: "-0.5px" }}>Linko.</div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: T.brand, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 13, color: T.white }}>{initial}</div>
        <button onClick={onProfile} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: 14, color: T.text }}>{name}</button>
      </div>
    </div>
  );
}

// Screen wrapper (full viewport, flex col)
function Screen({ children, dark = false, scrollBody = true }) {
  const bodyRef = useRef(null);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, []);

  const inner = scrollBody
    ? <div ref={bodyRef} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", WebkitOverflowScrolling: "touch" }}>{children}</div>
    : <>{children}</>;

  return (
    <div style={{ position: "fixed", inset: 0, background: dark ? "#0E0E1A" : T.bg, display: "flex", flexDirection: "column", zIndex: 1, fontFamily: "'Nunito Sans', sans-serif" }}>
      {inner}
    </div>
  );
}

// Scrollable content wrapper
function Content({ children, offsetTop = 0 }) {
  return (
    <div className="fade-in" style={{ maxWidth: 600, margin: "0 auto", padding: "20px 20px 40px", width: "100%", marginTop: offsetTop }}>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LOGIN
// ═══════════════════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, onSignUp }) {
  const [role, setRole] = useState('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [, showToast] = useToast();

  function submit() {
    if (!username || !password) {
      showToast('Please fill all fields', 'error');
      return;
    }
    const user = USERS[role];
    if (user && user.username === username && user.password === password) {
      onLogin(role);
      return;
    }
    showToast('Invalid username or password', 'error');
  }

  return (
    <Screen>
      <WaveHeader title="Login" subtitle="Hello, welcome back to your account" />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Content offsetTop={-30}>
          <div style={card}>
            <div style={{ display: 'flex', background: T.bg, borderRadius: 50, padding: 4, marginBottom: 20, gap: 4 }}>
              {['student', 'professor'].map(r => (
                <button key={r} onClick={() => setRole(r)} style={{
                  flex: 1, padding: 10, borderRadius: 50, border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: 13, fontFamily: 'Nunito, sans-serif',
                  background: role === r ? T.brand : 'transparent', color: role === r ? T.white : T.textMuted,
                  transition: 'all 0.2s'
                }}>
                  {r === 'student' ? 'Student' : 'Professor'}
                </button>
              ))}
            </div>
            <FocusInput label="Username" value={username} onChange={e => setUsername(e.target.value)} placeholder={role === 'student' ? 'karthick' : 'rajesh'} />
            <FocusInput label="Password" value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder={role === 'student' ? 'student123' : 'prof123'} onKeyDown={e => e.key === 'Enter' && submit()} />
            <button style={btn} onClick={submit}>Login</button>
            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: T.textMuted }}>
              Don't have an account? <span style={{ color: T.brand, fontWeight: 700, cursor: 'pointer' }} onClick={onSignUp}>Sign Up</span>
            </div>
          </div>
        </Content>
      </div>
    </Screen>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
//  SIGN UP
// ═══════════════════════════════════════════════════════════════════════════════
function SignUpScreen({ onBack, showToast }) {
  return (
    <Screen>
      <WaveHeader title="Sign Up" subtitle="Enter valid Credentials" />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content offsetTop={-30}>
          <div style={card}>
            <FocusInput label="Username" placeholder="Enter Username" />
            <FocusInput label="E-Mail" type="email" placeholder="Enter your Email Id" />
            <FocusInput label="Password" type="password" placeholder="Create Password" />
            <FocusInput label="Confirm Password" type="password" placeholder="Confirm password" />
            <button style={btn} onClick={() => { showToast("Account created!", "success"); onBack(); }}>Sign Up</button>
            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: T.textMuted }}>
              Already have an account?{" "}
              <span style={{ color: T.brand, fontWeight: 700, cursor: "pointer" }} onClick={onBack}>Login</span>
            </div>
          </div>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STUDENT HOME
// ═══════════════════════════════════════════════════════════════════════════════
function StudentHomeScreen({ onConnect, onProfile, scheduledSessions }) {
  const [query,   setQuery]   = useState("");
  const [answer,  setAnswer]  = useState(null);
  const [loading, setLoading] = useState(false);

  async function askAI() {
    if (!query.trim()) return;
    setLoading(true); setAnswer(null);
    try {
      const result = await askClaudeAI(query);
      setAnswer(result);
    } catch (err) {
      setAnswer("Sorry, could not get an answer. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <NavTopbar name="Karthick" initial="K" onProfile={onProfile} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18 }}>Hello, Karthick</div>
          <div style={{ fontSize: 13, color: T.textSoft, fontWeight: 500, marginTop: 2, marginBottom: 16 }}>How can we help you today?</div>

          {/* Ask AI */}
          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Ask your doubt</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && askAI()} placeholder="Ask your doubt here..."
                style={{ flex: 1, background: T.bg, border: `1.5px solid ${T.border}`, borderRadius: 50, padding: "11px 18px", fontSize: 14, fontFamily: "'Nunito Sans',sans-serif", color: T.text }} />
              <button onClick={askAI} style={{ ...btnSm }}>Ask your Doubt</button>
            </div>
            {(loading || answer) && (
              <div style={{ marginTop: 14, background: T.brandPale, borderRadius: 10, padding: "14px 16px", fontSize: 13, lineHeight: 1.7, color: T.text }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.brand, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>AI Answer</div>
                {loading ? "Thinking..." : answer}
              </div>
            )}
          </div>

          {/* Recent Doubts */}
          <div style={sectionHead}>Recent Doubts</div>
          <div style={card}>
            {["What is overfitting in machine learning?", "Explain cloud computing layers", "What is dynamic programming?"].map((d, i, arr) => (
              <div key={i} onClick={() => setQuery(d)} style={{ padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 13, color: T.textSoft, fontWeight: 500, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.color = T.brand}
                onMouseLeave={e => e.currentTarget.style.color = T.textSoft}
              >{d}</div>
            ))}
          </div>

          <div style={{ marginTop: 20 }}>
            <button style={btn} onClick={onConnect}>Connect to a Professor</button>
          </div>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  CONNECT / PROFESSOR LIST
// ═══════════════════════════════════════════════════════════════════════════════
function ConnectScreen({ onBack, onJoin, onSchedule }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filtered = PROFS.filter(p =>
    (filter === "All" || p.tag === filter) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.subj.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Screen>
      <Topbar title="Connect to a Professor" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", background: T.white, border: `1.5px solid ${T.border}`, borderRadius: 50, padding: "10px 16px", gap: 8, marginBottom: 14, boxShadow: "0 2px 8px rgba(91,79,207,0.08)" }}>
            <span style={{ color: T.textMuted, fontSize: 14 }}>&#128269;</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search professors or subjects..."
              style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontFamily: "'Nunito Sans',sans-serif", color: T.text }} />
          </div>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {FILTER_TAGS.map(tag => (
              <button key={tag} onClick={() => setFilter(tag)} style={{
                background: filter === tag ? T.brand : T.white,
                border: `1.5px solid ${filter === tag ? T.brand : T.border}`,
                borderRadius: 50, padding: "6px 14px", fontSize: 12, fontWeight: 700,
                fontFamily: "'Nunito', sans-serif",
                color: filter === tag ? T.white : T.textSoft, cursor: "pointer",
              }}>{tag}</button>
            ))}
          </div>

          {filtered.map(p => <ProfCard key={p.id} prof={p} onJoin={onJoin} onSchedule={onSchedule} />)}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 40, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>No professors found</div>}
        </Content>
      </div>
    </Screen>
  );
}

function ProfCard({ prof: p, onJoin, onSchedule }) {
  const offline = p.status === "offline";
  const [hovered, setHovered] = useState(false);
  return (
    <div style={{ ...card, marginBottom: 12, transition: "all 0.2s", boxShadow: hovered ? "0 4px 20px rgba(91,79,207,0.13)" : card.boxShadow, transform: hovered ? "translateY(-1px)" : "none" }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
        <Avatar initials={p.initials} color={p.color} size={46} />
        <div>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{p.name}</div>
          <div style={{ fontSize: 12, color: T.textSoft, fontWeight: 600 }}>{p.subj}</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontSize: 12 }}>
        <StatusPill status={p.status} />
        <span style={{ color: T.amber, fontWeight: 700, fontSize: 13 }}>&#9733; {p.rating}</span>
        <span style={{ color: T.textMuted, fontWeight: 600 }}>{p.sessions} sessions</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button style={{ ...btnSm, flex: 1, opacity: offline ? 0.4 : 1, cursor: offline ? "not-allowed" : "pointer" }}
          disabled={offline} onClick={() => !offline && onJoin(p)}>
          {offline ? "Unavailable" : "Join Meeting Now"}
        </button>
        <button style={{ ...btnSmOutline, opacity: offline ? 0.4 : 1, cursor: offline ? "not-allowed" : "pointer" }}
          disabled={offline} onClick={() => !offline && onSchedule(p)}>
          Schedule Later
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SCHEDULE MEETING
// ═══════════════════════════════════════════════════════════════════════════════
function ScheduleScreen({ prof, onBack, onConfirm, showToast }) {
  const [selDate, setSelDate] = useState(null);
  const [selSlot, setSelSlot] = useState(null);

  const today = new Date();
  const dates = Array.from({ length: 10 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return d; });

  function confirm() {
    if (!selDate) { showToast("Please select a date", "error"); return; }
    if (!selSlot) { showToast("Please select a time slot", "error"); return; }
    onConfirm({ prof, date: selDate.toDateString(), slot: selSlot });
  }

  return (
    <Screen>
      <Topbar title="Schedule Meeting" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content>
          {/* Selected professor */}
          <div style={{ background: T.brand, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
            <Avatar initials={prof.initials} color={prof.color} size={44} />
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, color: T.white }}>{prof.name}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{prof.subj}</div>
            </div>
          </div>

          {/* Date grid */}
          <div style={sectionHead}>Select Date</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8, marginBottom: 20 }}>
            {dates.map((d, i) => {
              const sel = selDate && d.toDateString() === selDate.toDateString();
              return (
                <div key={i} onClick={() => setSelDate(d)} style={{ background: sel ? T.brand : T.white, border: `1.5px solid ${sel ? T.brand : T.border}`, borderRadius: 12, padding: "10px 6px", textAlign: "center", cursor: "pointer", transition: "all 0.18s" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4, color: sel ? "rgba(255,255,255,0.8)" : T.textMuted }}>{DAYS_SHORT[d.getDay()]}</div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 16, color: sel ? T.white : T.text }}>{d.getDate()}</div>
                </div>
              );
            })}
          </div>

          {/* Slot grid */}
          <div style={sectionHead}>Select Time Slot</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 20 }}>
            {TIME_SLOTS.map(slot => {
              const sel = selSlot === slot;
              return (
                <div key={slot} onClick={() => setSelSlot(slot)} style={{ background: sel ? T.brand : T.white, border: `1.5px solid ${sel ? T.brand : T.border}`, borderRadius: 10, padding: 10, textAlign: "center", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Nunito', sans-serif", color: sel ? T.white : T.textSoft, transition: "all 0.18s" }}>{slot}</div>
              );
            })}
          </div>

          <button style={btn} onClick={confirm}>Confirm Meeting</button>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  MEETING CONFIRMED
// ═══════════════════════════════════════════════════════════════════════════════
function ConfirmedScreen({ booking, onHome }) {
  return (
    <Screen>
      <Topbar title="Meeting Confirmed" onBack={onHome} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content>
          <div style={{ background: `linear-gradient(135deg,${T.brand},${T.brandLight})`, borderRadius: 16, padding: 20, color: T.white, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 36, marginBottom: 8, fontWeight: 900, fontFamily: "'Nunito', sans-serif" }}>&#10003;</div>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18, marginBottom: 4 }}>Meeting Scheduled!</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{booking.prof.name} · {booking.date} at {booking.slot}</div>
          </div>

          <div style={sectionHead}>Session Details</div>
          <div style={card}>
            {[["Professor", booking.prof.name], ["Subject", booking.prof.subj], ["Date", booking.date], ["Time", booking.slot], ["Status", "Confirmed"]].map(([label, value], i, arr) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                <span style={{ color: T.textMuted, fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 700, color: label === "Status" ? T.green : T.text }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <button style={btn} onClick={onHome}>Back to Home</button>
          </div>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  VIDEO CALL
// ═══════════════════════════════════════════════════════════════════════════════
function VideoScreen({ prof, currentUser, onEnd }) {
  const [callSec, setCallSec] = useState(0);
  const ivRef = useRef(null);

  useEffect(() => {
    ivRef.current = setInterval(() => setCallSec(s => s + 1), 1000);
    return () => clearInterval(ivRef.current);
  }, []);

  const fmt = (s) => {
    s = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    return s;
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#0E0E1A', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar with timer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#0E0E1A', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 900, fontSize: 28, color: T.white }}>📹</div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 16, color: 'rgba(255,255,255,0.5)' }}>
          {fmt(callSec)}
        </div>
        <div style={{ width: 34 }} />
      </div>

      {/* Video tiles */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, padding: '24px 20px' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 32, color: T.white }}>
          {fmt(callSec)}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: -16 }}>Live Session</div>

        {/* Student Tile */}
        <div style={{ flex: 1, minWidth: 220, maxWidth: 340, background: '#1A1A2E', borderRadius: 20, aspectRatio: '4/3', 
                     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                     position: 'relative', border: '2px solid rgba(91,79,207,0.5)' }}>
          <Avatar initials={currentUser?.initials || 'K'} size={60} />
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, color: T.white, marginTop: 10 }}>
            {currentUser?.name || 'Karthick T.'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Student</div>
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(91,79,207,0.7)', color: T.white, 
                       fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
            YOU
          </div>
        </div>

        {/* Professor Tile */}
        <div style={{ flex: 1, minWidth: 220, maxWidth: 340, background: '#1A1A2E', borderRadius: 20, aspectRatio: '4/3', 
                     display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                     position: 'relative', border: '2px solid rgba(39,174,96,0.5)' }}>
          <Avatar initials={prof?.initials || 'RK'} color={prof?.color || ['#27AE60','#2ECC71']} size={60} />
          <div style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, color: T.white, marginTop: 10 }}>
            {prof?.name || 'Dr. Rajesh Kumar'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{prof?.subj || 'Artificial Intelligence'}</div>
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(229,57,53,0.85)', color: T.white, 
                       fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20 }}>
            LIVE
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px', justifyContent: 'center' }}>
        <button style={{ width: 52, height: 52, borderRadius: 50, border: 'none', background: 'rgba(91,79,207,0.6)', fontSize: 20, cursor: 'pointer' }}>🎤</button>
        <button style={{ width: 52, height: 52, borderRadius: 50, border: 'none', background: 'rgba(91,79,207,0.6)', fontSize: 20, cursor: 'pointer' }}>📹</button>
        <button onClick={() => { clearInterval(ivRef.current); onEnd(callSec); }} style={{
          background: T.red, border: 'none', borderRadius: 50, padding: '14px 36px', color: T.white,
          fontSize: 14, fontWeight: 800, fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(229,57,53,0.35)'
        }}>
          End Chat
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SESSION SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════
function SummaryScreen({ prof, duration, onHome, showToast }) {
  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  return (
    <Screen>
      <Topbar title="Session Summary" onBack={onHome} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content>
          <div style={sectionHead}>Session Overview</div>
          <div style={card}>
            {[["Student","Karthick T."],["Professor", prof?.name || "—"],["Subject", prof?.subj || "—"],["Duration", fmt(duration)]].map(([label, value], i) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? `1px solid ${T.border}` : "none", fontSize: 13 }}>
                <span style={{ color: T.textMuted, fontWeight: 600 }}>{label}</span>
                <span style={{ fontWeight: 700, color: T.text }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={sectionHead}>Key Topics Discussed</div>
          <div style={{ ...card, fontSize: 13, lineHeight: 1.9, color: T.textSoft }}>
            Supervised vs Unsupervised Learning<br />
            Neural Network architecture basics<br />
            Overfitting and regularization techniques<br />
            Practical tips for model evaluation
          </div>

          <div style={sectionHead}>Action Steps</div>
          <div style={{ ...card, fontSize: 13, lineHeight: 2, color: T.textSoft }}>
            1. Complete Andrew Ng's ML course Module 3<br />
            2. Implement a basic neural network in Python<br />
            3. Practice on Kaggle's Titanic dataset<br />
            4. Review cross-validation techniques
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={btn} onClick={() => showToast("Summary saved!", "success")}>Record Session</button>
            <button style={btnRed} onClick={onHome}>Return to Home</button>
          </div>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFESSOR DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════
function ProfessorScreen({ onLogout, onProfile, onAccept, scheduledSessions, showToast }) {
  const [avail, setAvail]       = useState(true);
  const [requests, setRequests] = useState([
    { id: "r1", name: "Karthick", subj: "Artificial Intelligence", initials: "AM", color: "#5B4FCF,#7B6FE8", time: "10 min ago" },
    { id: "r2", name: "Preethi S.",  subj: "Neural Networks",          initials: "PS", color: "#D97706,#FCD34D", time: "22 min ago" },
  ]);

  return (
    <Screen>
      <NavTopbar name="Dr. Rajesh" initial="R" onProfile={onProfile} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <Content>
          <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 18 }}>Meeting Room</div>
          <div style={{ fontSize: 13, color: T.textSoft, fontWeight: 500, marginTop: 2, marginBottom: 16 }}>Manage incoming requests</div>

          {/* Availability */}
          <div style={{ ...card, display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 2 }}>Availability</div>
              <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600 }}>Toggle to receive requests</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: avail ? T.green : T.textMuted }}>{avail ? "Online" : "Offline"}</span>
              <div onClick={() => { setAvail(v => !v); showToast(avail ? "You are now Offline" : "You are now Online", "info"); }}
                style={{ width: 44, height: 24, background: avail ? T.green : "#CBD5E1", borderRadius: 12, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 3, left: avail ? 22 : 3, width: 18, height: 18, background: "#fff", borderRadius: "50%", transition: "left 0.22s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 20 }}>
            {[["234", T.brand, "Sessions"], ["4.9", T.amber, "Rating"], [String(requests.length), T.green, "Requests"]].map(([val, color, label]) => (
              <div key={label} style={{ ...card, textAlign: "center", padding: "14px 10px" }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 22, color }}>{val}</div>
                <div style={{ fontSize: 12, color: T.textMuted, fontWeight: 600, marginTop: 2 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Incoming requests */}
          <div style={sectionHead}>Incoming Requests</div>
          {requests.length === 0 && <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>No pending requests</div>}
          {requests.map(req => (
            <div key={req.id} style={{ ...card, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 12 }}>
                <Avatar initials={req.initials} color={req.color} size={46} />
                <div>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 15, marginBottom: 2 }}>{req.name}</div>
                  <div style={{ fontSize: 12, color: T.textSoft, fontWeight: 600 }}>{req.subj}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: T.textMuted, fontWeight: 600, marginBottom: 12 }}>
                <span>{req.time}</span><span>Immediate session</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={btnSm} onClick={() => { setRequests(r => r.filter(x => x.id !== req.id)); onAccept(req); }}>Accept</button>
                <button style={btnSmOutline} onClick={() => { setRequests(r => r.filter(x => x.id !== req.id)); showToast("Request declined", "error"); }}>Decline</button>
              </div>
            </div>
          ))}

          {/* Upcoming sessions */}
          <div style={sectionHead}>Upcoming Sessions</div>
          {scheduledSessions.length === 0
            ? <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>No scheduled sessions yet</div>
            : scheduledSessions.map((sess, i) => (
              <div key={i} style={{ ...card, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14 }}>Session with Karthick T.</div>
                  <span style={{ background: T.brandPale, color: T.brand, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, fontFamily: "'Nunito', sans-serif" }}>Scheduled</span>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 6, fontSize: 12, color: T.textMuted, fontWeight: 600, flexWrap: "wrap" }}>
                  <span>{sess.prof.subj}</span><span>{sess.date}</span><span>{sess.slot}</span>
                </div>
              </div>
            ))
          }

          <div style={{ marginTop: 16 }}>
            <button style={btnRed} onClick={onLogout}>Log Out</button>
          </div>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  STUDENT PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
function StudentProfileScreen({ onBack, onLogout, scheduledSessions }) {
  return (
    <Screen>
      <Topbar title="My Profile" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ background: T.brand, padding: "28px 24px 50px" }} />
        <Content offsetTop={-30}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: -36, marginBottom: 16 }}>
            <Avatar initials="K" color={`${T.brand},${T.brandLight}`} size={80} border />
          </div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20 }}>Karthick T.</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, fontWeight: 600 }}>Student</div>
          </div>
          {[["Username","karthick_t"],["Email","karthick@university.edu"],["Sessions Completed","12"]].map(([label, val]) => (
            <div key={label} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
            </div>
            
          ))}

          <div style={sectionHead}>Upcoming Sessions</div>
          {scheduledSessions.length === 0
            ? <div style={{ textAlign: "center", padding: 20, color: T.textMuted, fontSize: 13, fontWeight: 600 }}>No sessions scheduled yet</div>
            : scheduledSessions.map((sess, i) => (
              <div key={i} style={{ ...card, marginBottom: 10 }}>
                <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: 14, marginBottom: 4 }}>{sess.prof.name}</div>
                <div style={{ display: "flex", gap: 12, fontSize: 12, color: T.textMuted, fontWeight: 600, flexWrap: "wrap" }}>
                  <span>{sess.prof.subj}</span><span>{sess.date}</span><span>{sess.slot}</span>
                </div>
                <span style={{ display: "inline-block", background: T.brandPale, color: T.brand, fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20, marginTop: 8, fontFamily: "'Nunito', sans-serif" }}>Scheduled</span>
              </div>
            ))}
          
        </Content>
      </div>
      
    </Screen>
    
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PROFESSOR PROFILE
// ═══════════════════════════════════════════════════════════════════════════════
function ProfProfileScreen({ onBack, onLogout }) {
  return (
    <Screen>
      <Topbar title="My Profile" onBack={onBack} />
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ background: T.brand, padding: "28px 24px 50px" }} />
        <Content offsetTop={-30}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: -36, marginBottom: 16 }}>
            <Avatar initials="R" color={`${T.brand},${T.brandLight}`} size={80} border />
          </div>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <div style={{ fontFamily: "'Nunito', sans-serif", fontWeight: 900, fontSize: 20 }}>Dr. Rajesh Kumar</div>
            <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3, fontWeight: 600 }}>Artificial Intelligence</div>
          </div>
          {[["Username","dr.rajesh"],["Email","rajesh@university.edu"],["Rating","4.9 / 5.0"]].map(([label, val]) => (
            <div key={label} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 16px", marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
          <div style={{ marginTop: 16 }}>
            <button style={btnRed} onClick={onLogout}>Log Out</button>
          </div>
        </Content>
      </div>
    </Screen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  ROOT APP
// ═══════════════════════════════════════════════════════════════════════════════
export default function LinkoApp() {
  const [screen,             setScreen]             = useState("login");
  const [role,               setRole]               = useState(null);
  const [activeProf,         setActiveProf]         = useState(null);
  const [scheduleProf,       setScheduleProf]       = useState(null);
  const [booking,            setBooking]            = useState(null);
  const [callDuration,       setCallDuration]       = useState(0);
  const [scheduledSessions,  setScheduledSessions]  = useState([]);
  const [toast,              showToast]             = useToast();

  function handleLogin(r) {
  if (!r) {
    showToast('Please fill all fields', 'error');
    return;
  }
  setRole(r);
  showToast(`Welcome back!`, 'success');
  setTimeout(() => setScreen(r === 'student' ? 'studentHome' : 'professor'), 600);
}

function handleLogout() {
  setRole(null);
  showToast('Logged out successfully!', 'success');
  setTimeout(() => setScreen('login'), 600);
}

  function handleJoin(prof) {
    setActiveProf(prof);
    showToast(`Connecting to ${prof.name}...`, "info");
    setTimeout(() => setScreen("video"), 900);
  }

  function handleSchedule(prof) {
    setScheduleProf(prof);
    setScreen("schedule");
  }

  function handleConfirmMeeting(b) {
    setBooking(b);
    setScheduledSessions(prev => [...prev, b]);
    showToast("Meeting scheduled!", "success");
    setScreen("confirmed");
  }

  function handleEndCall(sec) {
    setCallDuration(sec);
    setScreen("summary");
  }

  function handleProfAccept(req) {
  setActiveProf({ 
    name: req.name, 
    subj: req.subj, 
    initials: req.initials, 
    color: req.color 
  });
  setScreen('video');
}


  const screens = {
    login:          <LoginScreen          onLogin={handleLogin} onSignUp={() => setScreen("signup")} />,
    signup:         <SignUpScreen         onBack={() => setScreen("login")} showToast={showToast} />,
    studentHome:    <StudentHomeScreen    onConnect={() => setScreen("connect")} onProfile={() => setScreen("studentProfile")} scheduledSessions={scheduledSessions} />,
    connect:        <ConnectScreen        onBack={() => setScreen("studentHome")} onJoin={handleJoin} onSchedule={handleSchedule} />,
    schedule:       <ScheduleScreen       prof={scheduleProf} onBack={() => setScreen("connect")} onConfirm={handleConfirmMeeting} showToast={showToast} />,
    confirmed:      <ConfirmedScreen      booking={booking} onHome={() => setScreen("studentHome")} />,
    video:          <VideoScreen          prof={activeProf} onEnd={handleEndCall} />,
    summary:        <SummaryScreen        prof={activeProf} duration={callDuration} onHome={() => setScreen("studentHome")} showToast={showToast} />,
    professor:      <ProfessorScreen      onLogout={() => setScreen("login")} onProfile={() => setScreen("profProfile")} onAccept={handleProfAccept} scheduledSessions={scheduledSessions} showToast={showToast} />,
    studentProfile: <StudentProfileScreen onBack={() => setScreen("studentHome")} onLogout={() => setScreen("login")} scheduledSessions={scheduledSessions} />,
    profProfile:    <ProfProfileScreen    onBack={() => setScreen("professor")} onLogout={() => setScreen("login")} />,
  };

  return (
    <>
      <FontLink />
      <GlobalStyles />
      {screens[screen] || screens.login}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}

// mount the root component when running in browser
import ReactDOM from "react-dom/client";
import React from "react";

const established = typeof document !== "undefined" && document.getElementById("root");
if (established) {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<LinkoApp />);
}
