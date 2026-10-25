import React from 'react'
import { Link } from 'react-router-dom';
import "./Contestsample.css"
import { useState, useEffect } from 'react';

function countdownTimer(TotalSeconds) {
    const [secremaining, setSecremaining] = useState(TotalSeconds);

    useEffect(() => {
        const id = setInterval(() => {
            setSecremaining(prev => prev <= 0 ? TotalSeconds : prev - 1);
        }, 1000)
        return () => clearInterval(id);
    }, [secremaining]);
    return secremaining;
}

const Contestsample = () => {
    const problems = [
        { id: "A", title: "Projectile on an Inclined Plane", difficulty: "Easy" },
        { id: "B", title: "Mole Fraction in Ideal Gas Mixture", difficulty: "Medium" },
        { id: "C", title: "Charged Particle in Crossed Fields", difficulty: "Hard" },
        { id: "D", title: "Evaluate lim (x→0) [sin x / x]", difficulty: "Easy" },
        { id: "E", title: "Integration by Parts: ∫ln(x) dx", difficulty: "Medium" },
        { id: "F", title: "Henderson–Hasselbalch pH Calculation", difficulty: "Medium" },

    ];
    const Students = [
        { rank: 1, name: "Arjun S.", score: 300, avatar: "A" },
        { rank: 2, name: "Rinshu", score: 295, avatar: "R" },
        { rank: 3, name: "You", score: 290, avatar: "ME" },
        { rank: 4, name: "Rohan", score: 270, avatar: "R" },
        { rank: 5, name: "Sneha", score: 260, avatar: "S" },
        { rank: 6, name: "Ananya", score: 250, avatar: "A" },
        { rank: 7, name: "Karan", score: 240, avatar: "K" },
        { rank: 8, name: "Priya", score: 230, avatar: "P" },
        { rank: 9, name: "Vikram", score: 220, avatar: "V" },
        { rank: 10, name: "Aisha", score: 180, avatar: "A" }
    ]

    const minutes = Math.floor(countdownTimer(45 * 60) / 60);
    const seconds = countdownTimer(45 * 60) % 60;

    const formatTime = (time) => String(time).padStart(2, '0');
    return (
        <>
            <div className="division"></div>
            <div className="contest-sample-container">
                <div className="contest-sample-heading">
                    <h2 className="contest-sample-main-heading">Experience the Thrill of Competitive Solving!</h2>
                    <p className="contest-sample-subheading">Weekly timed contests. Real problems from JEE Mains & Advanced. A global Elo* rating that rises with every win.</p>
                </div>
                <div className="contest-sample-content">
                    <div className="contest-sample-content-top">

                        <div className="csctop-left">
                            <div className="cs-live">
                                <div className="live-dot"></div>
                                <span className="live-text">LIVE</span>
                            </div>

                            <div className="cs-contest-name">PCM Weekly Contest #42</div>
                        </div>

                        <div className="cs-timer">
                            <div className="clock-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="12" cy="12" r="9" stroke="#27ae60" strokeWidth="2" />
                                    <path d="M12 7v5l3 2" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M12 3v2" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M12 19v2" stroke="#27ae60" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="running-timer">{formatTime(minutes)}:{formatTime(seconds)}</div>
                        </div>

                    </div>
                    <div className="contest-sample-content-bottom">
                        <div className="contest-sample-content-left">
                            <div className="problems-header">Problems</div>
                            <div className="problems-container">
                                {problems.map((problem, idx) => (
                                    <div key={idx} className="problem-card">
                                        <div className="problem-id">{problem.id}</div>
                                        <div className="problem-title">{problem.title}</div>
                                        <div className="problem-difficulty" data-difficulty={problem.difficulty}>
                                            {problem.difficulty}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="cs-analysis">
                                <div className="cs-solved">
                                    <div className="analysis-header">Solved</div>
                                    <div className="analysis-content">10/12</div>
                                </div>
                                <div className="cs-Your-score">
                                    <div className="analysis-header">Your Score</div>
                                    <div className="analysis-content">290</div>
                                </div>
                                <div className="cs-Your-rank">
                                    <div className="analysis-header">Your Rank</div>
                                    <div className="analysis-content">3</div>
                                </div>
                                <div className="cs-Participants">
                                    <div className="analysis-header">Participants</div>
                                    <div className="analysis-content">1246</div>
                                </div>
                            </div>
                        </div>
                        <div className="contest-sample-content-right">
                            <div className="cs-leaderboard-header">
                                Live Leaderboard
                            </div>
                            <div className="cs-leaderboard-container">
                                {Students.map((student, idx) => (
                                    <div key={idx} className={student.name == "You" ? "your-card" : "student-card"}>
                                        <div className="student-rank">{student.rank}</div>
                                        <div className="student-avatar">{student.avatar}</div>
                                        <div className="student-name">{student.name}</div>
                                        <div className="student-score">{student.score}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="constest-sample-footer">
                    <div className="cs-feature-tag">
                        <div className="cs-feature-tag-icon">⏱</div>
                        <div className="cs-features-tag-text">
                            Timed — 90 minutes</div>
                    </div>

                    <div className="cs-feature-tag">
                        <div className="cs-feature-tag-icon">♟</div>
                        <div className="cs-features-tag-text">
                            Elo rating after every contest</div>
                    </div>
                    <div className="cs-feature-tag">
                        <div className="cs-feature-tag-icon">📅</div>
                        <div className="cs-features-tag-text">
                            Every Sunday, 8 AM IST</div>
                    </div>
                    <div className="cs-feature-tag">
                        <div className="cs-feature-tag-icon">🏆</div>
                        <div className="cs-features-tag-text">
                            Weekly leaderboard reset</div>
                    </div>
                    <div className="cs-feature-tag">
                        <div className="cs-feature-tag-icon">📂</div>
                        <div className="cs-features-tag-text">
                            All past contests available</div>
                    </div>
                    <div className="cs-feature-tag">
                        <div className="cs-feature-tag-icon">🆓</div>
                        <div className="cs-features-tag-text">
                            Free to participate</div>
                    </div>
                </div>
                <div className="cs-cta">
                    <Link to="/signup">
                        <button className="cs-cta-button">
                            Learn more about contests →
                        </button>
                    </Link>
                </div>
            </div>

        </>
    )
}

export default Contestsample
