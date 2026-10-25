import React, { useEffect } from 'react'
import './Section3.css'

const Section3 = () => {
  useEffect(() => {
    window.addEventListener('keydown',(e) => {
     if(e.key == 'e'){
      alert("Screenshot is disabled")
     }   
  })
  }
  ,[])
  return (
    <>
      <div className="division"></div>
      <div className="exactly-container">
        <div className="exactly-heading">
            What exactly we provide?
        </div>
      </div>
    </>
  )
}

export default Section3
