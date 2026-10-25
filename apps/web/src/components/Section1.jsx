import React, { useEffect } from 'react'
import "./Section1.css"
import { Link } from 'react-router-dom'
import { useState, useRef } from 'react'
const Section1 = () => {

  const [hovered, setHovered] = useState(false);
  const [tchovered, setTchHovered] = useState(false);

  const canvasRef = useRef(null);
  useEffect(() => {
    if (!tchovered) return;
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const width = canvas.width = 300
    const height = canvas.height = 300

    const particles = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * -height,
      speed: 1 + Math.random() * 1.2,
      size: 16 + Math.random() * 10,
      opacity: 0.3 + Math.random() * 0.7
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = "16px";
      ctx.textAlign = "center";

      for (let p of particles) {
        ctx.fillStyle = `rgba(0,255,255,${p.opacity})`;
        ctx.fillText("a + b i ", p.x, p.y);
        p.y += p.speed;
        if (p.y > height + 20) p.y = -20;
      }

      requestAnimationFrame(draw);
    }

    draw()
  }, [tchovered]);

  // Function to generate a random hex color
  const grc = () => {
    const randomNumber = Math.floor(Math.random() * 16777216);
    let hexColor = randomNumber.toString(16);

    hexColor = hexColor.padStart(6, '0');

    return `#${hexColor}`;
  }

  return (
    <>
      <div className="division"></div>
      <div className="demo-container">
        <div className="demo-heading">
          <h2>Explore Our Free Demo Chapters*
          </h2>
          <p>Concept Clarity Like Never Before
          </p>
        </div>
        <div className="demo-chapters">
          <Link to="/chapter/r">
            <div className="fc c">
              <div className="demo-text">Rotational Mechanics
              </div>
              <div className="demo-cdesc">Dive into spinning systems</div>
              <img src="src\assets\wheel.png" alt="Rounding Wheel" />
            </div>
          </Link>
          <Link to="/chapter/as">
            <div className="sc c" onMouseEnter={() => { setHovered(true) }} onMouseLeave={() => { setHovered(false) }}>
              <div className="demo-text">Atomic Structure</div>
              <div className="demo-cdesc">Explore the heart of the atom</div>
              <img src="src\assets\Atom.png" alt="" />
              {
                Array.from({ length: 20 }).map((_, i) => {
                  return (
                    <div className='demo-electron' key={i} style={{
                      animation: hovered ? `wave 0.7s linear ${Math.random() * 5}s 5` : 'none',
                      background: `linear-gradient(to left,white,${grc()},transparent)`,
                      bottom: `${Math.random() * 200}px`,
                      boxShadow: `0px 0px 15px 5px ${grc()}`,
                      transform: `scale(${0.7 + Math.random() * 1})`
                    }}>
                    </div>
                  )
                })
              }
            </div>
          </Link>
          <Link to="/chapter/cn">
            <div className="tc c" onMouseEnter={() => { setTchHovered(true) }} onMouseLeave={() => { setTchHovered(false) }}>
              {tchovered && <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  pointerEvents: "none",
                  zIndex: 1
                }}
              />}
              <div className="demo-text">Complex Number</div>
              <div className="demo-cdesc">Unlock imaginary powers</div>
              <img src="src\assets\cn2.png" alt="complex number" />
            </div>
          </Link>
        </div>
        <div className="demo-caution">
          *The content in this chapter is more than enough for both <b>JEE Main</b> and <b>JEE Advanced</b>. You can focus entirely on learning without worrying about missing out on anything.
        </div>
      </div>
    </>
  )
}

export default Section1
