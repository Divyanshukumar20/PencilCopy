import React from 'react'
import './Section2.css'
import Moving_chapters from './Moving_chapters.jsx'

const Section2 = () => {
  return (
    <>
      <div className="divider-line"></div>
       
      <div className="trust-builder-container">
      <Moving_chapters/>
        <div className="trust-builder-heading">
          <h2 className="main-question">Can't Solve JEE Questions?</h2>
          <p className="congrats-text">
            <span className="highlight">Congrats,</span> You are at the perfect place
          </p>
        </div>
        
        <div className="features-section">
          <div className="features-header">
            <h3 className="features-title">Why this is a perfect place?</h3>
            <div className="title-underline"></div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✨</div>
              <div className="feature-content">
                <h4>Animated Concept Chapters</h4>
                <p>Visual, animated walkthroughs of every concept to help you truly understand the fundamentals</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚔️</div>
              <div className="feature-content">
                <h4>1000+ Problem Arena</h4>
                <p>Exam-style problem arena with 1000+ curated JEE questions to sharpen your problem-solving skills</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <div className="feature-content">
                <h4>Weekly Contests</h4>
                <p>Compete in weekly contests with other students and track your progress in real-time</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <div className="feature-content">
                <h4>Built for Understanding</h4>
                <p>Designed for students who want to actually understand JEE, not just memorize solutions</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-content">
                <h4>Difficulty-Rated Questions</h4>
                <p>Practice questions sorted by difficulty level, helping you build confidence step by step and focus on the right challenge</p>
              </div>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🏷️</div>
              <div className="feature-content">
                <h4>Topic-Wise Tagged Problems</h4>
                <p>Explore problems tagged by topic and gauge difficulty with acceptance rates based on how other students perform</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Section2