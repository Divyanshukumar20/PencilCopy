import React from 'react'
import { Link } from 'react-router-dom'
import "./Home.css"
import Section1 from '../../components/Section1.jsx'
import Section2 from '../../components/Section2.jsx'
import Section3 from '../../components/Section3.jsx'
import ProblemArena from '../../components/ProblemArena.jsx'
import Contestsample from '../../components/Contestsample.jsx'
import Testimonials from '../../components/Testimonials.jsx'
import Steps from '../../components/Steps.jsx'

const Home = () => {
  return (
    <>

      <div className="hero-container">
        <h1 className="hero-title">
          <span className="hero-subtitle">
            Welcome to
          </span>
          <span className="hero-main-title">
            PencilCopy
          </span>
          <span className="hero-tagline">Your Study Adventure Begins Here!</span>
          <div className='border'></div>
        </h1>
        <div className="hero-detail">
          <div className="hero-right1">
            <img src="src\assets\chatgpt13.png" alt="Icon" height='400px' />
          </div>
          <div className="hero-left">
            <div className="desc1">
              Why Just Study, When You Can Dominate?
            </div>
            <div className="desc2">
              Forget Boring Notes. Enter the Game of Concepts.
            </div>
            <div className="cta">
              <Link to="/signup">
                <button className="cta-button1">
                  Start Learning
                </button>
              </Link>
              <Link to="/signup">
                <button className="cta-button2">
                  <span>
                    How it works
                    <span className="q-container">
                      <span className="q-symbol">?</span>
                      <span className="morph-symbol">💡</span> 
                    </span>
                  </span>
                </button>
              </Link>


            </div>
          </div>

          <div className="hero-right">
            <img src="src\assets\chatgpt14.png" alt="Icon" height='400px' />
          </div>
        </div>
      </div>
      <Section2/>
     <Section1/>
     <ProblemArena/>
     <Contestsample/>
     <Steps/>
     <Testimonials/>
    </>
  )
}
export default Home
