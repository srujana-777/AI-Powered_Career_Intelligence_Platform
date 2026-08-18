import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";

function InterviewPrep() {
  const [activeTab, setActiveTab] = useState("explorer"); // 'explorer' | 'flashcard' | 'mocktest'
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [search, setSearch] = useState("");
  
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Expanded Answers State
  const [expandedAnswers, setExpandedAnswers] = useState({});
  
  // Bookmarks and Mastered tracking in LocalStorage
  const [mastered, setMastered] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cs_mastered_q") || "[]");
    } catch {
      return [];
    }
  });

  const [bookmarked, setBookmarked] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("cs_bookmarked_q") || "[]");
    } catch {
      return [];
    }
  });

  // AI Evaluation Modal State
  const [evalModal, setEvalModal] = useState({ open: false, question: null });
  const [userAnswer, setUserAnswer] = useState("");
  const [evalResult, setEvalResult] = useState(null);
  const [evaluating, setEvaluating] = useState(false);

  // Flashcards State
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Mock Test State
  const [mockQuestions, setMockQuestions] = useState([]);
  const [mockActive, setMockActive] = useState(false);
  const [userOptions, setUserOptions] = useState({});
  const [mockSubmitted, setMockSubmitted] = useState(false);
  const [mockScore, setMockScore] = useState(0);

  // Fetch Questions
  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams({
      category: category,
      difficulty: difficulty,
      search: search,
    }).toString();

    fetch(`http://127.0.0.1:8000/interview-prep/questions?${query}`)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions || []);
        if (data.categories && data.categories.length > 0) {
          setCategories(data.categories);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        setLoading(false);
      });
  }, [category, difficulty, search]);

  // Persist Mastered & Bookmarked
  useEffect(() => {
    localStorage.setItem("cs_mastered_q", JSON.stringify(mastered));
  }, [mastered]);

  useEffect(() => {
    localStorage.setItem("cs_bookmarked_q", JSON.stringify(bookmarked));
  }, [bookmarked]);

  const toggleMastered = (id) => {
    setMastered((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleBookmarked = (id) => {
    setBookmarked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAnswer = (id) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Submit Answer to AI Evaluator Endpoint
  const handleEvaluate = async () => {
    if (!userAnswer.trim() || !evalModal.question) return;
    setEvaluating(true);
    setEvalResult(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/interview-prep/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question_id: evalModal.question.id,
          user_answer: userAnswer,
        }),
      });
      const data = await response.json();
      setEvalResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to evaluate answer. Please try again.");
    } finally {
      setEvaluating(false);
    }
  };

  // Start Mock Test
  const startMockTest = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/interview-prep/mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: category, count: 5 }),
      });
      const data = await res.json();
      setMockQuestions(data.questions || []);
      setUserOptions({});
      setMockSubmitted(false);
      setMockActive(true);
    } catch (err) {
      console.error(err);
      alert("Could not load mock test.");
    }
  };

  const handleSelectOption = (questionId, optionIdx) => {
    if (mockSubmitted) return;
    setUserOptions((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  const submitMockTest = () => {
    let score = 0;
    mockQuestions.forEach((q) => {
      if (userOptions[q.id] === q.correct_option) {
        score += 1;
      }
    });
    setMockScore(score);
    setMockSubmitted(true);
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case "Easy":
        return { bg: "#dcfce7", text: "#15803d", border: "#86efac" };
      case "Medium":
        return { bg: "#fef3c7", text: "#b45309", border: "#fde047" };
      case "Hard":
        return { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" };
      default:
        return { bg: "#e0f2fe", text: "#0369a1", border: "#7dd3fc" };
    }
  };

  const categoryIcons = {
    "All": "🌐",
    "Data Structures & Algorithms": "⚡",
    "Object-Oriented Programming": "🧩",
    "Operating Systems": "🖥️",
    "DBMS & SQL": "🗄️",
    "Computer Networks": "📡",
    "System Design": "🏗️",
    "Software Engineering": "🛠️"
  };

  const currentFlashcard = questions[flashcardIndex] || null;

  return (
    <Layout>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "10px 20px 40px" }}>
        
        {/* Header Hero Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
            color: "white",
            padding: "30px 25px",
            borderRadius: "16px",
            marginBottom: "25px",
            boxShadow: "0 10px 25px -5px rgba(49, 46, 129, 0.4)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span style={{ fontSize: "32px" }}>🧠</span>
              <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
                Computer Science Interview Preparation
              </h1>
            </div>
            <p style={{ margin: "5px 0 20px 0", color: "#c7d2fe", fontSize: "16px", maxWidth: "750px" }}>
              Master foundational and advanced CS concepts: Data Structures, OOPs, Operating Systems, DBMS & SQL, Computer Networks, and System Design with AI-evaluated responses and interactive practice modes.
            </p>

            {/* Overall Progress Stats */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
              <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ color: "#a5b4fc", fontSize: "13px", display: "block" }}>Mastered Concepts</span>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>{mastered.length} / {questions.length || 14}</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ color: "#a5b4fc", fontSize: "13px", display: "block" }}>Bookmarked</span>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>{bookmarked.length}</span>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.12)", backdropFilter: "blur(10px)", padding: "10px 18px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.2)" }}>
                <span style={{ color: "#a5b4fc", fontSize: "13px", display: "block" }}>Interview Readiness</span>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>
                  {Math.round((mastered.length / Math.max(questions.length, 1)) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "20px",
            borderBottom: "2px solid #e2e8f0",
            paddingBottom: "10px"
          }}
        >
          <button
            onClick={() => setActiveTab("explorer")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "explorer" ? "#312e81" : "#f1f5f9",
              color: activeTab === "explorer" ? "white" : "#475569",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            📚 Concept Explorer & Q&A
          </button>
          <button
            onClick={() => {
              setActiveTab("flashcard");
              setFlashcardIndex(0);
              setIsFlipped(false);
            }}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "flashcard" ? "#312e81" : "#f1f5f9",
              color: activeTab === "flashcard" ? "white" : "#475569",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            🎴 Flashcards Practice Mode
          </button>
          <button
            onClick={() => setActiveTab("mocktest")}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "mocktest" ? "#312e81" : "#f1f5f9",
              color: activeTab === "mocktest" ? "white" : "#475569",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s"
            }}
          >
            ⚡ AI Mock Test Challenge
          </button>
        </div>

        {/* Categories Bar */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "20px"
          }}
        >
          {(categories.length > 0
            ? categories
            : [
                "All",
                "Data Structures & Algorithms",
                "Object-Oriented Programming",
                "Operating Systems",
                "DBMS & SQL",
                "Computer Networks",
                "System Design",
                "Software Engineering",
              ]
          ).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: category === cat ? "2px solid #312e81" : "1px solid #cbd5e1",
                background: category === cat ? "#e0e7ff" : "white",
                color: category === cat ? "#312e81" : "#475569",
                fontWeight: category === cat ? "700" : "500",
                fontSize: "14px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                boxShadow: category === cat ? "0 2px 6px rgba(49,46,129,0.15)" : "none"
              }}
            >
              <span>{categoryIcons[cat] || "📘"}</span>
              <span>{cat}</span>
            </button>
          ))}
        </div>

        {/* Filter Controls Bar */}
        <div
          style={{
            background: "white",
            padding: "16px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            marginBottom: "25px",
            display: "flex",
            flexWrap: "wrap",
            gap: "15px",
            alignItems: "center"
          }}
        >
          {/* Search Box */}
          <div style={{ flex: "1", minWidth: "240px", position: "relative" }}>
            <input
              type="text"
              placeholder="🔍 Search concepts, topics (e.g. Memory, Cache, DP, Two Pointers, Google)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box"
              }}
            />
          </div>

          {/* Difficulty Dropdown */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              style={{
                padding: "10px 14px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "14px",
                background: "white",
                cursor: "pointer"
              }}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div style={{ color: "#64748b", fontSize: "14px" }}>
            Showing <b>{questions.length}</b> concept topics
          </div>
        </div>

        {/* TAB 1: CONCEPT EXPLORER MODE */}
        {activeTab === "explorer" && (
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px", color: "#64748b" }}>
                <h2>🔄 Loading CS Concepts...</h2>
              </div>
            ) : questions.length === 0 ? (
              <div style={{ background: "white", padding: "40px", borderRadius: "12px", textAlign: "center" }}>
                <h3>No concepts found matching your filters.</h3>
                <button
                  onClick={() => {
                    setCategory("All");
                    setDifficulty("All");
                    setSearch("");
                  }}
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    background: "#312e81",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                {questions.map((q) => {
                  const isExpanded = !!expandedAnswers[q.id];
                  const isM = mastered.includes(q.id);
                  const isB = bookmarked.includes(q.id);
                  const diffColor = getDifficultyColor(q.difficulty);

                  return (
                    <div
                      key={q.id}
                      style={{
                        background: "white",
                        borderRadius: "14px",
                        padding: "22px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        borderLeft: `6px solid ${isM ? "#22c55e" : "#4338ca"}`,
                        transition: "all 0.2s ease"
                      }}
                    >
                      {/* Top Badges */}
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" }}>
                            {q.category}
                          </span>
                          <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                            {q.topic}
                          </span>
                          <span
                            style={{
                              background: diffColor.bg,
                              color: diffColor.text,
                              border: `1px solid ${diffColor.border}`,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontWeight: "700"
                            }}
                          >
                            {q.difficulty}
                          </span>
                        </div>

                        {/* Company Tags */}
                        <div style={{ display: "flex", gap: "6px" }}>
                          {q.company_tags.map((comp) => (
                            <span key={comp} style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "500" }}>
                              💼 {comp}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Question Heading */}
                      <h3 style={{ margin: "0 0 15px 0", color: "#0f172a", fontSize: "18px", lineHeight: "1.4" }}>
                        {q.question}
                      </h3>

                      {/* Action Buttons */}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
                        <button
                          onClick={() => toggleAnswer(q.id)}
                          style={{
                            padding: "8px 16px",
                            background: isExpanded ? "#4338ca" : "#f1f5f9",
                            color: isExpanded ? "white" : "#334155",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          {isExpanded ? "📖 Hide Concept Solution" : "💡 Reveal Solution & Explanation"}
                        </button>

                        <button
                          onClick={() => setEvalModal({ open: true, question: q })}
                          style={{
                            padding: "8px 16px",
                            background: "#0284c7",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: "pointer",
                            fontSize: "14px"
                          }}
                        >
                          🎯 Test My Explanation (AI Feedback)
                        </button>

                        <button
                          onClick={() => toggleMastered(q.id)}
                          style={{
                            padding: "8px 14px",
                            background: isM ? "#dcfce7" : "#ffffff",
                            color: isM ? "#15803d" : "#64748b",
                            border: `1px solid ${isM ? "#86efac" : "#cbd5e1"}`,
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "13px"
                          }}
                        >
                          {isM ? "✅ Mastered" : "⏳ Mark Mastered"}
                        </button>

                        <button
                          onClick={() => toggleBookmarked(q.id)}
                          style={{
                            padding: "8px 14px",
                            background: isB ? "#fef3c7" : "#ffffff",
                            color: isB ? "#b45309" : "#64748b",
                            border: `1px solid ${isB ? "#fde047" : "#cbd5e1"}`,
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "13px"
                          }}
                        >
                          {isB ? "⭐ Bookmarked" : "☆ Bookmark"}
                        </button>
                      </div>

                      {/* Expanded Solution Panel */}
                      {isExpanded && (
                        <div
                          style={{
                            marginTop: "20px",
                            padding: "20px",
                            background: "#f8fafc",
                            borderRadius: "10px",
                            border: "1px solid #e2e8f0"
                          }}
                        >
                          <h4 style={{ margin: "0 0 10px 0", color: "#312e81" }}>📘 Detailed Explanation:</h4>
                          <p style={{ color: "#334155", lineHeight: "1.6", whiteSpace: "pre-line", fontSize: "15px" }}>
                            {q.explanation}
                          </p>

                          {/* Key Concepts Pills */}
                          <div style={{ marginTop: "15px" }}>
                            <strong style={{ color: "#475569", fontSize: "13px" }}>Key Concepts to Remember:</strong>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                              {q.key_concepts.map((kc, idx) => (
                                <span key={idx} style={{ background: "#e2e8f0", color: "#1e293b", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "600" }}>
                                  ✓ {kc}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Code Example Snippet */}
                          {q.code_example && (
                            <div style={{ marginTop: "18px" }}>
                              <strong style={{ color: "#475569", fontSize: "13px" }}>Code / Architecture Example:</strong>
                              <pre
                                style={{
                                  background: "#0f172a",
                                  color: "#38bdf8",
                                  padding: "16px",
                                  borderRadius: "8px",
                                  overflowX: "auto",
                                  fontSize: "13px",
                                  lineHeight: "1.5",
                                  marginTop: "8px"
                                }}
                              >
                                <code>{q.code_example}</code>
                              </pre>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FLASHCARDS PRACTICE MODE */}
        {activeTab === "flashcard" && (
          <div>
            {!currentFlashcard ? (
              <div style={{ textAlign: "center", padding: "50px", background: "white", borderRadius: "12px" }}>
                <h3>No questions available for flashcard mode. Try clearing filters.</h3>
              </div>
            ) : (
              <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                {/* Flashcard Counter & Controls */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ fontWeight: "bold", color: "#475569" }}>
                    Card {flashcardIndex + 1} of {questions.length}
                  </span>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => {
                        setFlashcardIndex((prev) => Math.max(0, prev - 1));
                        setIsFlipped(false);
                      }}
                      disabled={flashcardIndex === 0}
                      style={{ padding: "6px 14px", borderRadius: "6px", cursor: flashcardIndex === 0 ? "not-allowed" : "pointer" }}
                    >
                      ← Previous
                    </button>
                    <button
                      onClick={() => {
                        setFlashcardIndex((prev) => Math.min(questions.length - 1, prev + 1));
                        setIsFlipped(false);
                      }}
                      disabled={flashcardIndex === questions.length - 1}
                      style={{ padding: "6px 14px", borderRadius: "6px", cursor: flashcardIndex === questions.length - 1 ? "not-allowed" : "pointer" }}
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Flip Card Component */}
                <div
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{
                    background: isFlipped ? "#1e1b4b" : "white",
                    color: isFlipped ? "white" : "#0f172a",
                    padding: "40px 30px",
                    borderRadius: "16px",
                    minHeight: "320px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center",
                    cursor: "pointer",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.12)",
                    border: "2px dashed #cbd5e1",
                    transition: "all 0.3s ease"
                  }}
                >
                  {!isFlipped ? (
                    <div>
                      <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "4px 12px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>
                        {currentFlashcard.category} • {currentFlashcard.topic}
                      </span>
                      <h2 style={{ marginTop: "20px", fontSize: "22px", lineHeight: "1.4" }}>
                        {currentFlashcard.question}
                      </h2>
                      <p style={{ marginTop: "30px", color: "#64748b", fontSize: "14px" }}>
                        👆 Click card to flip and reveal answer
                      </p>
                    </div>
                  ) : (
                    <div style={{ textAlign: "left", width: "100%" }}>
                      <h4 style={{ color: "#a5b4fc", margin: "0 0 10px 0" }}>💡 Solution & Concept:</h4>
                      <p style={{ color: "#e0e7ff", lineHeight: "1.6", fontSize: "15px", whiteSpace: "pre-line" }}>
                        {currentFlashcard.explanation}
                      </p>
                      {currentFlashcard.code_example && (
                        <pre style={{ background: "#0f172a", color: "#38bdf8", padding: "12px", borderRadius: "8px", fontSize: "12px", overflowX: "auto" }}>
                          <code>{currentFlashcard.code_example}</code>
                        </pre>
                      )}
                      <p style={{ marginTop: "20px", textAlign: "center", color: "#818cf8", fontSize: "13px" }}>
                        👆 Click card to flip back
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: AI MOCK TEST MODE */}
        {activeTab === "mocktest" && (
          <div>
            {!mockActive ? (
              <div style={{ background: "white", padding: "40px", borderRadius: "16px", textAlign: "center", maxWidth: "600px", margin: "0 auto", boxShadow: "0 4px 15px rgba(0,0,0,0.06)" }}>
                <h2>⚡ Computer Science Practice Quiz</h2>
                <p style={{ color: "#64748b", margin: "15px 0 25px 0" }}>
                  Generate a timed 5-question multiple choice test based on selected CS category ({category}). Instant scoring & detailed explanations provided upon submission.
                </p>
                <button
                  onClick={startMockTest}
                  style={{
                    padding: "14px 30px",
                    background: "linear-gradient(135deg, #4338ca, #312e81)",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(49, 46, 129, 0.3)"
                  }}
                >
                  🚀 Start 5-Question Mock Quiz
                </button>
              </div>
            ) : (
              <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {mockSubmitted && (
                  <div style={{ background: "#f0fdf4", border: "2px solid #86efac", padding: "20px", borderRadius: "12px", marginBottom: "20px", textAlign: "center" }}>
                    <h2 style={{ color: "#166534", margin: 0 }}>
                      🎉 Test Submitted! Score: {mockScore} / {mockQuestions.length}
                    </h2>
                    <p style={{ color: "#15803d", marginTop: "5px" }}>
                      {mockScore === mockQuestions.length
                        ? "Perfect score! Outstanding mastery of CS fundamentals!"
                        : mockScore >= 3
                        ? "Great job! Review the missed questions below to sharpen your knowledge."
                        : "Keep practicing! Review the explanations for each topic."}
                    </p>
                    <button
                      onClick={startMockTest}
                      style={{ marginTop: "10px", padding: "8px 18px", background: "#166534", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Retake Quiz
                    </button>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                  {mockQuestions.map((q, qIdx) => {
                    const selectedOpt = userOptions[q.id];
                    return (
                      <div key={q.id} style={{ background: "white", padding: "22px", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#312e81" }}>
                          Q{qIdx + 1}. {q.question}
                        </h4>
                        <span style={{ fontSize: "12px", background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", color: "#475569" }}>
                          Category: {q.category}
                        </span>

                        <div style={{ marginTop: "15px", display: "flex", flexDirection: "column", gap: "10px" }}>
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedOpt === optIdx;
                            const isCorrect = q.correct_option === optIdx;
                            let btnBg = isSelected ? "#e0e7ff" : "#f8fafc";
                            let btnBorder = isSelected ? "#4338ca" : "#e2e8f0";

                            if (mockSubmitted) {
                              if (isCorrect) {
                                btnBg = "#dcfce7";
                                btnBorder = "#22c55e";
                              } else if (isSelected && !isCorrect) {
                                btnBg = "#fee2e2";
                                btnBorder = "#ef4444";
                              }
                            }

                            return (
                              <div
                                key={optIdx}
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                style={{
                                  padding: "12px 16px",
                                  borderRadius: "8px",
                                  border: `2px solid ${btnBorder}`,
                                  background: btnBg,
                                  cursor: mockSubmitted ? "default" : "pointer",
                                  fontWeight: isSelected ? "bold" : "normal",
                                  fontSize: "14px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px"
                                }}
                              >
                                <span style={{ fontWeight: "bold" }}>{String.fromCharCode(65 + optIdx)}.</span>
                                <span>{opt}</span>
                                {mockSubmitted && isCorrect && <span style={{ marginLeft: "auto", color: "#15803d" }}>✓ Correct</span>}
                                {mockSubmitted && isSelected && !isCorrect && <span style={{ marginLeft: "auto", color: "#b91c1c" }}>✗ Your Answer</span>}
                              </div>
                            );
                          })}
                        </div>

                        {mockSubmitted && (
                          <div style={{ marginTop: "15px", padding: "12px", background: "#f1f5f9", borderRadius: "8px", fontSize: "13px", color: "#334155" }}>
                            <b>Explanation:</b> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {!mockSubmitted && (
                    <button
                      onClick={submitMockTest}
                      style={{
                        padding: "14px",
                        background: "#22c55e",
                        color: "white",
                        fontSize: "16px",
                        fontWeight: "bold",
                        border: "none",
                        borderRadius: "10px",
                        cursor: "pointer",
                        marginTop: "10px"
                      }}
                    >
                      Submit Mock Test Answers
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI EVALUATION MODAL */}
        {evalModal.open && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(15, 23, 42, 0.7)",
              backdropFilter: "blur(4px)",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px"
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: "16px",
                width: "100%",
                maxWidth: "650px",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "25px",
                boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ margin: 0, color: "#312e81" }}>🎯 AI Interview Answer Evaluator</h3>
                <button
                  onClick={() => setEvalModal({ open: false, question: null })}
                  style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" }}
                >
                  ✕
                </button>
              </div>

              <p style={{ fontWeight: "600", color: "#1e293b", fontSize: "15px" }}>
                {evalModal.question?.question}
              </p>

              <textarea
                rows={5}
                placeholder="Type your explanation or answer here as if responding to an interviewer..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "14px",
                  boxSizing: "border-box",
                  marginBottom: "15px"
                }}
              />

              <button
                onClick={handleEvaluate}
                disabled={evaluating || !userAnswer.trim()}
                style={{
                  width: "100%",
                  padding: "12px",
                  background: evaluating ? "#94a3b8" : "#312e81",
                  color: "white",
                  fontWeight: "bold",
                  border: "none",
                  borderRadius: "8px",
                  cursor: evaluating ? "not-allowed" : "pointer"
                }}
              >
                {evaluating ? "🤖 Evaluating Your Response..." : "Evaluate Answer"}
              </button>

              {evalResult && (
                <div style={{ marginTop: "20px", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold", color: "#312e81" }}>
                      Score: {evalResult.score} / 10
                    </span>
                    <span style={{ background: evalResult.score >= 7 ? "#dcfce7" : "#fef3c7", color: evalResult.score >= 7 ? "#15803d" : "#b45309", padding: "4px 10px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px" }}>
                      {evalResult.verdict}
                    </span>
                  </div>

                  <p style={{ color: "#334155", fontSize: "14px" }}>{evalResult.feedback}</p>

                  {evalResult.key_points_covered.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <strong style={{ color: "#166534", fontSize: "12px" }}>✓ Concepts Covered:</strong>
                      <ul>
                        {evalResult.key_points_covered.map((k, i) => (
                          <li key={i} style={{ color: "#166534", fontSize: "13px" }}>{k}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {evalResult.key_points_missed.length > 0 && (
                    <div style={{ marginTop: "10px" }}>
                      <strong style={{ color: "#991b1b", fontSize: "12px" }}>✗ Concepts Missed:</strong>
                      <ul>
                        {evalResult.key_points_missed.map((k, i) => (
                          <li key={i} style={{ color: "#991b1b", fontSize: "13px" }}>{k}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div style={{ marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "10px" }}>
                    <strong style={{ color: "#312e81", fontSize: "13px" }}>Model Answer Reference:</strong>
                    <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5" }}>{evalResult.model_answer}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
}

export default InterviewPrep;
