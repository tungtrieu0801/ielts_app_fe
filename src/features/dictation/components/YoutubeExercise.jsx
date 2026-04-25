import React, { useState, useEffect, useRef, useCallback } from "react";

// ── YouTube IFrame API ────────────────────────────────────────────────────
let ytApiPromise = null;
function loadYouTubeIframeAPI() {
    if (ytApiPromise) return ytApiPromise;
    ytApiPromise = new Promise((resolve) => {
        if (window.YT?.Player) { resolve(window.YT); return; }
        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT); };
        if (!document.getElementById("yt-api-script")) {
            const s = document.createElement("script");
            s.id = "yt-api-script"; s.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(s);
        }
    });
    return ytApiPromise;
}

function useYouTubePlayer(divRef, videoId) {
    const playerRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (!divRef.current || !videoId) return;
        let dead = false;
        loadYouTubeIframeAPI().then((YT) => {
            if (dead) return;
            playerRef.current = new YT.Player(divRef.current, {
                videoId,
                playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
            });
        });
        return () => {
            dead = true; clearInterval(timerRef.current);
            try { playerRef.current?.destroy(); } catch (_) { }
            playerRef.current = null;
        };
    }, [videoId]); // eslint-disable-line

    const seekAndPlay = useCallback((start, end) => {
        const p = playerRef.current;
        if (!p?.seekTo) return;
        clearInterval(timerRef.current);
        p.seekTo(Math.max(0, start - 0.05), true);
        p.playVideo();
        if (end != null) {
            timerRef.current = setInterval(() => {
                try {
                    const t = p.getCurrentTime?.();
                    if (typeof t === "number" && t >= end - 0.02) {
                        p.pauseVideo?.(); clearInterval(timerRef.current);
                    }
                } catch (_) { clearInterval(timerRef.current); }
            }, 30);
        }
    }, []);

    const pauseVideo = useCallback(() => {
        clearInterval(timerRef.current);
        playerRef.current?.pauseVideo?.();
    }, []);

    return { seekAndPlay, pauseVideo };
}

// ── Scoring ───────────────────────────────────────────────────────────────
const norm = (s) => s.toLowerCase().trim().replace(/[.,;:!?'"’\-]/g, "").replace(/\s+/g, " ");

function getHintParts(answer, correct) {
    const ansWords = answer.trim().split(/\s+/).filter(Boolean);
    const corWords = norm(correct).split(" ").filter(Boolean);
    let okCount = 0;
    for (let i = 0; i < Math.min(ansWords.length, corWords.length); i++) {
        if (norm(ansWords[i]) === corWords[i]) okCount = i + 1;
        else break;
    }
    const origWords = correct.trim().split(/\s+/).filter(Boolean);
    const correctPrefix = origWords.slice(0, okCount).join(" ");
    
    // Replace all alphanumeric characters in the remaining words with asterisks
    const remainingWords = origWords.slice(okCount);
    const maskedSuffix = remainingWords.map(w => w.replace(/[a-zA-Z0-9À-ỹ]/g, '*')).join(" ");
    
    return { okCount, correctPrefix, maskedSuffix };
}

function buildRetainedAnswer(answer, correct) {
    const { okCount } = getHintParts(answer, correct);
    const origWords = correct.trim().split(/\s+/).filter(Boolean);
    const kept = origWords.slice(0, okCount).join(" ");
    return kept ? kept + " " : "";
}

// ── UI Styles ─────────────────────────────────────────────────────────────
const S = {
    panel: {
        background: "#F2F6FA",
        borderRadius: 20,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #E2E8F0"
    },
    header: {
        padding: "12px 20px",
        background: "#E2E8F0",
        borderBottom: "1px solid #CBD5E0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0
    },
    title: {
        fontSize: 14,
        fontWeight: 800,
        color: "#2D3748",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    },
    buttonPrimary: {
        background: "linear-gradient(135deg, #3182CE 0%, #4299E1 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 14px rgba(49,130,206,0.3)"
    },
    buttonSuccess: {
        background: "linear-gradient(135deg, #38A169 0%, #48BB78 100%)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.2s",
        boxShadow: "0 4px 14px rgba(56,161,105,0.3)"
    }
};

// ── Note Table ────────────────────────────────────────────────────────────
const NoteTable = () => {
    const [en, setEn] = useState("");
    const [vi, setVi] = useState("");
    const [rows, setRows] = useState([]);
    const enRef = useRef(null);
    const viRef = useRef(null);

    const commit = useCallback(() => {
        if (!en.trim() && !vi.trim()) return;
        setRows(p => [{ id: Date.now(), en, vi }, ...p]);
        setEn(""); setVi("");
        setTimeout(() => enRef.current?.focus(), 30);
    }, [en, vi]);

    const exportCSV = () => {
        const csv = "English,Vietnamese\n" + rows.map(r =>
            `"${r.en.replace(/"/g, '""')}","${r.vi.replace(/"/g, '""')}"`
        ).join("\n");
        const a = document.createElement("a");
        a.href = URL.createObjectURL(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }));
        a.download = "notes.csv"; a.click();
    };

    const inp = {
        flex: 1, border: "none", background: "transparent", outline: "none",
        fontSize: 14, padding: "10px 12px", fontFamily: "inherit", color: "inherit",
    };

    return (
        <div style={{ ...S.panel, flex: 1, borderTop: "4px solid #ED8936" }}>
            <div style={{ ...S.header, background: "#FEEBC8", borderBottom: "1px solid #FBD38D" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>📝</span>
                    <span style={{ ...S.title, color: "#C05621" }}>Ghi chú từ vựng</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 11, color: "#C05621", fontWeight: 700, background: "rgba(221,107,32,0.1)", padding: "4px 10px", borderRadius: 12 }}>Tab = Chuyển cột · Enter = Thêm</span>
                    <button onClick={exportCSV} style={{ ...S.buttonPrimary, background: "linear-gradient(135deg, #DD6B20 0%, #ED8936 100%)", boxShadow: "0 4px 10px rgba(221,107,32,0.3)", padding: "6px 14px", fontSize: 12 }}>↓ CSV</button>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", padding: 12, background: "#F7FAFC", gap: 8 }}>
                <div style={{ display: "flex", background: "#EDF2F7", borderRadius: "8px 8px 0 0", borderBottom: "1px solid #E2E8F0", flexShrink: 0 }}>
                    <div style={{ flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 800, color: "#4A5568", textTransform: "uppercase" }}>Tiếng Anh</div>
                    <div style={{ width: 1, background: "#E2E8F0" }} />
                    <div style={{ flex: 1, padding: "8px 12px", fontSize: 12, fontWeight: 800, color: "#4A5568", textTransform: "uppercase" }}>Tiếng Việt</div>
                </div>

                <div style={{ display: "flex", borderBottom: `2px solid #ED8936`, background: "#FFF5F5", flexShrink: 0, boxShadow: "0 4px 12px rgba(237,137,54,0.05)", borderRadius: "0 0 8px 8px" }}>
                    <input ref={enRef} value={en} onChange={e => setEn(e.target.value)}
                        placeholder="Từ / cụm từ mới..."
                        style={{ ...inp, fontWeight: 700, color: "#9B2C2C" }}
                        onKeyDown={e => { if (e.key === "Tab") { e.preventDefault(); viRef.current?.focus(); } }}
                    />
                    <div style={{ width: 1, background: "rgba(237,137,54,0.1)" }} />
                    <input ref={viRef} value={vi} onChange={e => setVi(e.target.value)}
                        placeholder="Nghĩa tiếng Việt..."
                        style={{ ...inp, fontWeight: 700, color: "#9B2C2C" }}
                        onKeyDown={e => {
                            if (e.key === "Enter") { e.preventDefault(); commit(); }
                            if (e.key === "Tab" && e.shiftKey) { e.preventDefault(); enRef.current?.focus(); }
                        }}
                    />
                </div>

                <div style={{ flex: 1, overflowY: "auto", borderRadius: 8, background: "#fff", border: "1px solid #E2E8F0" }}>
                    {rows.length === 0 && (
                        <div style={{ padding: "30px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 12, opacity: 0.6 }}>
                            <span style={{ fontSize: 36 }}>💡</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#718096" }}>Gõ từ mới và nhấn Enter để lưu lại</span>
                        </div>
                    )}
                    {rows.map((r, i) => (
                        <div key={r.id} style={{ display: "flex", borderBottom: "1px solid #E2E8F0", background: i % 2 === 0 ? "#FAFAFA" : "#fff", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(237,137,54,0.05)"} onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "#FAFAFA" : "#fff"}>
                            <div style={{ flex: 1, padding: "10px 12px", fontSize: 14, fontWeight: 600, color: "#2D3748" }}>{r.en}</div>
                            <div style={{ width: 1, background: "#E2E8F0", flexShrink: 0 }} />
                            <div style={{ flex: 1, padding: "10px 12px", fontSize: 14, color: "#4A5568" }}>{r.vi}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ── Finished Screen ───────────────────────────────────────────────────────
const FinishedScreen = ({ total, correct, wrong, onReset }) => {
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 24, background: "#EDF2F7", borderRadius: 24 }}>
            <div style={{ fontSize: 80, textShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>{pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👏" : "💪"}</div>
            <div style={{ textAlign: "center" }}>
                <h2 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #3182CE, #805AD5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Tuyệt vời!</h2>
                <p style={{ color: "#718096", margin: 0, fontSize: 16 }}>Bạn đã hoàn thành {total} câu nghe chép chính tả.</p>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                {[
                    ["Chính xác", correct, "#38A169", "rgba(56,161,105,0.1)"],
                    ["Sai sót", wrong, "#E53E3E", "rgba(229,62,62,0.1)"],
                    ["Điểm số", `${pct}%`, "#3182CE", "rgba(49,130,206,0.1)"]
                ].map(([l, v, c, bg]) => (
                    <div key={l} style={{ padding: "20px 30px", background: "#F7FAFC", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: `2px solid ${bg}`, textAlign: "center", minWidth: 120 }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: c }}>{v}</div>
                        <div style={{ fontSize: 13, color: "#718096", marginTop: 4, fontWeight: 700, textTransform: "uppercase" }}>{l}</div>
                    </div>
                ))}
            </div>
            <button onClick={onReset} style={{ ...S.buttonPrimary, padding: "14px 40px", fontSize: 16, marginTop: 10, boxShadow: "0 10px 20px rgba(49,130,206,0.3)" }}>
                🔄 Bắt đầu bài mới
            </button>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────
const YoutubeExercise = ({ data, onReset }) => {
    const { exercises, videoId, title } = data;
    const [idx, setIdx] = useState(0);
    const [answer, setAnswer] = useState("");
    const [attemptResult, setAttemptResult] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [stats, setStats] = useState({ correct: 0, wrong: 0 });
    const [finished, setFinished] = useState(false);
    const [done, setDone] = useState([]);

    const playerRef = useRef(null);
    const taRef = useRef(null);
    const transcriptRef = useRef(null);
    
    const stateRef = useRef({});
    stateRef.current = { answer, attemptResult, idx };

    const { seekAndPlay, pauseVideo } = useYouTubePlayer(playerRef, videoId);
    const seekRef = useRef(seekAndPlay); seekRef.current = seekAndPlay;

    const cur = exercises[idx];
    const curRef = useRef(cur); curRef.current = cur;

    useEffect(() => {
        if (!cur) return;
        setAnswer(""); setAttemptResult(null); setAttempts(0);
        const t = setTimeout(() => {
            seekRef.current(cur.start ?? 0, cur.end);
            setTimeout(() => taRef.current?.focus(), 350);
        }, 350);
        return () => clearTimeout(t);
    }, [idx]); // eslint-disable-line

    useEffect(() => {
        if (transcriptRef.current) transcriptRef.current.scrollTop = 0;
    }, [done.length]);

    const goNext = useCallback((forceSkip = false) => {
        if (idx >= exercises.length - 1) setFinished(true);
        else setIdx(p => p + 1);
        if (forceSkip) {
            setStats(p => ({ ...p, wrong: p.wrong + 1 }));
            setDone(p => [{
                idx,
                original: curRef.current.original,
                translated: curRef.current.translated,
                start: curRef.current.start,
                end: curRef.current.end,
                ok: false,
                skipped: true,
            }, ...p]);
        }
    }, [idx, exercises.length]);
    const goNextRef = useRef(goNext); goNextRef.current = goNext;

    const submit = useCallback(() => {
        const { answer: ans } = stateRef.current;
        if (!ans.trim()) return;
        pauseVideo();
        const cur = curRef.current;
        const allCorrect = norm(ans) === norm(cur.original);
        setAttempts(p => p + 1);

        if (allCorrect) {
            setAttemptResult({ allCorrect: true });
            setStats(p => ({ ...p, correct: p.correct + 1 }));
            setDone(p => [{
                idx: stateRef.current.idx,
                original: cur.original,
                translated: cur.translated,
                start: cur.start,
                end: cur.end,
                ok: true,
            }, ...p]);
        } else {
            const hintParts = getHintParts(ans, cur.original);
            setAttemptResult({ allCorrect: false, hintParts });
            const retained = buildRetainedAnswer(ans, cur.original);
            setAnswer(retained);
            setTimeout(() => {
                if (taRef.current) {
                    taRef.current.focus();
                    const len = taRef.current.value.length;
                    taRef.current.setSelectionRange(len, len);
                }
            }, 30);
        }
    }, [pauseVideo]);
    const submitRef = useRef(submit); submitRef.current = submit;

    const handleGoNext = useCallback(() => {
        if (stateRef.current.attemptResult?.allCorrect) goNextRef.current(false);
    }, []);
    const handleGoNextRef = useRef(handleGoNext); handleGoNextRef.current = handleGoNext;

    useEffect(() => {
        let ctrl = false, ctrlOther = false;
        const kd = (e) => {
            if (e.key === "Control") { ctrl = true; ctrlOther = false; return; }
            if (ctrl) ctrlOther = true;
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (stateRef.current.attemptResult?.allCorrect) handleGoNextRef.current();
                else submitRef.current();
            }
        };
        const ku = (e) => {
            if (e.key === "Control") {
                if (!ctrlOther && curRef.current) seekRef.current(curRef.current.start ?? 0, curRef.current.end);
                ctrl = false; ctrlOther = false;
            }
        };
        window.addEventListener("keydown", kd);
        window.addEventListener("keyup", ku);
        return () => { window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); };
    }, []);

    if (finished) return <FinishedScreen total={exercises.length} correct={stats.correct} wrong={stats.wrong} onReset={onReset} />;
    if (!cur) return null;

    const pct = (idx / exercises.length) * 100;
    const isCorrect = attemptResult?.allCorrect === true;
    const hasAttempt = attemptResult !== null;

    return (
        <div style={{ display: "flex", height: "100%", overflow: "hidden", gap: 16, padding: 16, background: "#CBD5E0", boxSizing: "border-box" }}>

            {/* ═══ LEFT COLUMN (55%) — Video + Input ═══ */}
            <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>

                <div style={{ ...S.panel, flexShrink: 0, position: "relative" }}>
                    <div style={{ width: "100%", aspectRatio: "16/9", background: "#000", maxHeight: "48vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div ref={playerRef} style={{ width: "100%", height: "100%", maxWidth: "calc(48vh * 16 / 9)" }} />
                    </div>
                    <div style={{ height: 4, background: "rgba(0,0,0,0.5)", width: "100%" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: "#E53E3E", transition: "width 0.4s ease", boxShadow: "0 0 10px #E53E3E" }} />
                    </div>
                </div>

                <div style={{ ...S.panel, flex: 1, minHeight: 0 }}>
                    <div style={S.header}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>⌨️</span>
                            <span style={S.title}>Khu vực viết</span>
                        </div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 4, alignItems: "center", background: "rgba(56,161,105,0.1)", padding: "2px 8px", borderRadius: 12 }}>
                                <span style={{ fontSize: 12, color: "#38A169", fontWeight: 800 }}>✓ {stats.correct}</span>
                            </div>
                            <div style={{ display: "flex", gap: 4, alignItems: "center", background: "rgba(229,62,62,0.1)", padding: "2px 8px", borderRadius: 12 }}>
                                <span style={{ fontSize: 12, color: "#E53E3E", fontWeight: 800 }}>✗ {stats.wrong}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", padding: 16, flex: 1, gap: 12, overflowY: "auto", overflowX: "hidden" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{
                                    width: 10, height: 10, borderRadius: "50%",
                                    background: isCorrect ? "#38A169" : hasAttempt ? "#E53E3E" : "#3182CE",
                                    transition: "background 0.3s",
                                    animation: !hasAttempt ? "pulse 1.5s infinite" : "none",
                                    boxShadow: !hasAttempt ? "0 0 10px #3182CE" : "none"
                                }} />
                                <span style={{ fontSize: 13, fontWeight: 800, color: "#2D3748", letterSpacing: "0.05em" }}>CÂU {idx + 1} / {exercises.length}</span>
                                {attempts > 0 && !isCorrect && (
                                    <span style={{ fontSize: 11, background: "rgba(229,62,62,0.1)", color: "#C53030", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>Thử {attempts} lần</span>
                                )}
                            </div>
                        </div>

                        <textarea
                            ref={taRef}
                            value={answer}
                            onChange={e => !isCorrect && setAnswer(e.target.value)}
                            placeholder="Gõ những gì bạn nghe được… (Enter để kiểm tra, Shift+Enter xuống dòng)"
                            disabled={isCorrect}
                            style={{
                                flex: 1, minHeight: "80px", width: "100%", padding: 16,
                                borderRadius: 12, resize: "none",
                                border: `2px solid ${!hasAttempt ? "#CBD5E0" : isCorrect ? "#38A169" : "#E53E3E"}`,
                                background: !hasAttempt ? "#fff" : isCorrect ? "rgba(56,161,105,0.04)" : "rgba(255,250,250,1)",
                                fontSize: 15, fontFamily: "inherit", color: "#2D3748", outline: "none",
                                transition: "all 0.25s", boxSizing: "border-box", lineHeight: 1.6,
                                boxShadow: !hasAttempt ? "inset 0 2px 4px rgba(0,0,0,0.02)" :
                                           isCorrect ? "0 0 0 3px rgba(56,161,105,0.2)" :
                                           "0 0 0 3px rgba(229,62,62,0.15)"
                            }}
                        />

                        {/* Clean Hint UI (Mô phỏng Image 2) */}
                        {hasAttempt && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 8px", animation: "fadeIn 0.2s ease" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div style={{ 
                                        color: isCorrect ? "#2F855A" : "#D69E2E", 
                                        fontWeight: 700, fontSize: 15, display: "flex", alignItems: "center", gap: 6 
                                    }}>
                                        {isCorrect ? "✅ Chính xác!" : "⚠️ Sai rồi"}
                                    </div>
                                    {!isCorrect && attempts > 0 && (
                                        <button
                                            onClick={() => goNextRef.current(true)}
                                            style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", fontSize: 13, cursor: "pointer", color: "#4A5568", fontWeight: 600, transition: "all 0.2s" }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = "#E53E3E"; e.currentTarget.style.color = "#C53030"; e.currentTarget.style.background = "rgba(229,62,62,0.05)" }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.color = "#4A5568"; e.currentTarget.style.background = "#fff" }}
                                        >
                                            Bỏ qua
                                        </button>
                                    )}
                                </div>
                                {!isCorrect && attemptResult.hintParts && (
                                    <div style={{ fontSize: 16, fontFamily: "inherit", lineHeight: 1.5 }}>
                                        <span style={{ color: "#276749", fontWeight: 700 }}>{attemptResult.hintParts.correctPrefix}</span>
                                        <span style={{ color: "#A0AEC0", letterSpacing: "1px" }}> {attemptResult.hintParts.maskedSuffix}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                            <button
                                onClick={() => cur && seekRef.current(cur.start ?? 0, cur.end)}
                                style={{ flex: "0 0 auto", padding: "11px 16px", borderRadius: 10, border: "2px solid #CBD5E0", background: "#EDF2F7", fontSize: 13, cursor: "pointer", color: "#4A5568", fontWeight: 800, transition: "all 0.2s" }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = "#A0AEC0"; e.currentTarget.style.background = "#E2E8F0"; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = "#CBD5E0"; e.currentTarget.style.background = "#EDF2F7"; }}
                            >
                                🎧 Nghe lại
                            </button>
                            {!isCorrect ? (
                                <button
                                    onClick={submit} disabled={!answer.trim()}
                                    style={{ ...S.buttonPrimary, flex: 1, padding: "11px 0", fontSize: 14, opacity: answer.trim() ? 1 : 0.6, cursor: answer.trim() ? "pointer" : "not-allowed" }}
                                >
                                    ✨ Kiểm tra (Enter)
                                </button>
                            ) : (
                                <button
                                    onClick={() => goNextRef.current(false)}
                                    style={{ ...S.buttonSuccess, flex: 1, padding: "11px 0", fontSize: 14, boxShadow: "0 4px 12px rgba(56,161,105,0.3)" }}
                                >
                                    {idx >= exercises.length - 1 ? "🏁 Hoàn thành bài" : "Câu tiếp theo (Enter) ➔"}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ RIGHT COLUMN (45%) — Transcript + Note ═══ */}
            <div style={{ flex: "0 0 45%", display: "flex", flexDirection: "column", gap: 16, overflow: "hidden" }}>
                <div style={{ ...S.panel, flex: "0 0 52%" }}>
                    <div style={S.header}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 16 }}>📜</span>
                            <span style={S.title}>Transcript</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#4A5568", fontWeight: 700, background: "#CBD5E0", padding: "4px 10px", borderRadius: 12 }}>
                            {title ? (title.length > 30 ? title.substring(0, 30) + '...' : title) : `${exercises.length} câu`}
                        </span>
                    </div>

                    <div ref={transcriptRef} style={{ flex: 1, overflowY: "auto", padding: 12, background: "#F7FAFC", display: "flex", flexDirection: "column", gap: 8 }}>
                        {done.length === 0 && (
                            <div style={{ padding: "40px 20px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, opacity: 0.5 }}>
                                <span style={{ fontSize: 32 }}>👀</span>
                                <span style={{ fontSize: 13, fontWeight: 700, color: "#718096" }}>Các câu bạn đã hoàn thành sẽ xuất hiện ở đây</span>
                            </div>
                        )}
                        {done.map((s) => (
                            <div
                                key={s.idx}
                                onClick={() => seekRef.current(s.start, s.end)}
                                style={{
                                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                                    border: "1px solid #E2E8F0",
                                    background: "#fff",
                                    borderLeft: `4px solid ${s.ok ? "#38A169" : "#E53E3E"}`,
                                    transition: "all 0.2s",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                                }}
                                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.02)"; }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.5, color: "#2D3748" }}>
                                        {s.original}
                                    </div>
                                    <div style={{ fontSize: 10, fontWeight: 800, color: s.ok ? "#2F855A" : "#C53030", background: s.ok ? "rgba(56,161,105,0.15)" : "rgba(229,62,62,0.15)", padding: "4px 8px", borderRadius: 8, flexShrink: 0 }}>
                                        {s.skipped ? "⏭" : `#${s.idx + 1}`}
                                    </div>
                                </div>
                                {/* Duo sub */}
                                <div style={{ fontSize: 13, color: "#A0AEC0", fontWeight: 600, fontStyle: "italic", marginTop: 4 }}>
                                    {s.translated || "(Bản dịch tiếng Việt đang cập nhật...)"}
                                </div>
                                <div style={{ fontSize: 10, color: "#718096", marginTop: 8, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                                    <span style={{ color: "#3182CE" }}>▶</span> {s.start?.toFixed(1)}s
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <NoteTable />
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                ::-webkit-scrollbar { width: 8px; height: 8px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #CBD5E0; border-radius: 10px; }
                ::-webkit-scrollbar-thumb:hover { background: #A0AEC0; }
            `}</style>
        </div>
    );
};

export default YoutubeExercise;
