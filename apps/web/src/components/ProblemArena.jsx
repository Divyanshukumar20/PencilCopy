import React from 'react'
import "./ProblemArena.css"
import { Link } from 'react-router-dom'


const ProblemArena = () => {
  const problems = [
    { id: 1, title: 'Projectile on an Inclined Plane', difficulty: 'Medium', subject: 'Physics', accept: '47%', attempts: '8.2k', appearedIn: 'JEE Adv 2021' },
    { id: 2, title: 'Mole Fraction in Ideal Gas Mixture', difficulty: 'Easy', subject: 'Chemistry', accept: '71%', attempts: '12.4k', appearedIn: 'JEE Mains 2023' },
    { id: 3, title: 'Evaluate lim (x→0) [sin x / x]', difficulty: 'Easy', subject: 'Maths', accept: '83%', attempts: '18.1k', appearedIn: '' },
    { id: 4, title: 'Charged Particle in Crossed Fields', difficulty: 'Hard', subject: 'Physics', accept: '28%', attempts: '5.6k', appearedIn: '' },
    { id: 5, title: 'Henderson–Hasselbalch pH Calculation', difficulty: 'Medium', subject: 'Chemistry', accept: '52%', attempts: '7.3k', appearedIn: 'JEE Mains 2022' },
    { id: 6, title: 'Integration by Parts: ∫ln(x) dx', difficulty: 'Medium', subject: 'Maths', accept: '61%', attempts: '9.8k', appearedIn: '' },
    { id: 7, title: 'Projectile on an Inclined Plane 2', difficulty: 'Hard', subject: 'Physics', accept: '31%', attempts: '4.1k', appearedIn: 'JEE Adv 2020' },
    { id: 8, title: 'Hybridisation of XeF₄', difficulty: 'Easy', subject: 'Chemistry', accept: '77%', attempts: '14.2k', appearedIn: '' }
  ]



  return (
    <>
    <div className="division"></div>
    <div className="problem-arena">
      <div className="arena-title">
        <h2>Problem Arena</h2>
        <p>1000+ problems. Rated. Tagged.</p>
      </div>
      <div className="problem-arena-button">
        <Link to="/signup">
          <button className="all-problems-button">
            View all problems →
          </button>
        </Link>
      </div>
      <div className="table-container">
        <table className="problems-table">
          <thead>
            <tr>
              <th>TITLE</th>
              <th>DIFF</th>
              <th>SUBJECT</th>
              <th>ACCEPTANCE RATE</th>
              <th>ATTEMPTS</th>
              <th>APPEARED IN</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((problem) => (
              <tr key={problem.id} className="problem-row">
                <td className="title-cell">{problem.title}</td>
                <td>
                  <span className="difficulty-badge" data-difficulty={problem.difficulty}>
                    {problem.difficulty}
                  </span>
                </td>
                <td>
                  <span className="subject-badge">
                    {problem.subject}
                  </span>
                </td>
                <td className="percentage">{problem.accept}</td>
                <td className="attempts">{problem.attempts}</td>
                <td className="appeared-in">{problem.appearedIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-bottom">Showing 8 of 1000+ problems.
      <Link to="/signup"><span>Sign up to access all →</span></Link>
     </div>
    </div>
    </>
  )
}

export default ProblemArena
