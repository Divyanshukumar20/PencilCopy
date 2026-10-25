import React from 'react'
import "./Moving_chapters.css"

const Moving_chapters = () => {

const chapters = [
  "🧪 Mole Concept",
  "📐 Vectors & 3D",
  "🌈 Electromagnetic Waves",
  "🎯 Probability",
  "🧠 General Organic Chemistry",
  "🏎️ Laws of Motion",
  "📈 Statistics",
  "⚙️ d-Block Elements",
  "∫ Indefinite Integration",
  "🔋 Current Electricity",
  "🧬 Biomolecules",
  "📊 Binomial Theorem",
  "💡 Semiconductors",
  "🌍 Gravitation",
  "📐 Matrices & Determinants",
  "⚡ Electrostatics",
  "🍷 Alcohols Phenols Ethers",
  "📏 Straight Lines",
  "🔬 p-Block Elements",
  "🎵 Simple Harmonic Motion",
  "🧲 Coordination Compounds",
  "📈 Continuity",
  "🌊 Wave Optics",
  "⚛️ Atomic Structure",
  "🛢️ Hydrocarbons",
  "🔄 Inverse Trigonometry",
  "⚖️ Thermodynamics",
  "🌀 Rotational Dynamics",
  "📊 Differential Equations",
  "📏 Units & Dimensions",
  "⚡ Chemical Equilibrium",
  "⭕ Circles",
  "🧵 Polymers",
  "🔥 Kinetic Theory",
  "✏️ Differentiation",
  "💨 Gaseous State",
  "🔋 Redox Reactions",
  "🌊 Mechanical Properties",
  "☢️ Nuclear Physics",
  "📈 Quadratic Equations",
  "📡 Alternating Current",
  "🧭 Magnetism & Matter",
  "🧱 s-Block Elements",
  "🔢 Sets & Relations",
  "⚛️ Dual Nature",
  "🧪 Carbonyl Compounds",
  "📊 Periodic Table",
  "∮ Definite Integration",
  "🌊 Wave Motion",
  "⛏️ Metallurgy",
  "🔄 Work Power Energy",
  "🔍 Ray Optics",
  "📐 Conic Sections",
  "🧫 Haloalkanes Haloarenes",
  "⚗️ Chemical Bonding",
  "💊 Everyday Chemistry",
  "⚡ Electromagnetic Induction",
  "∞ Limits & Derivatives",
  "➕ Complex Numbers",
  "🔄 Kinematics",
  "🌍 Environmental Chemistry",
  "🏛️ Atomic Structure",
  "🎲 Permutations Combinations",
  "📉 Applications of Derivatives",
  "🧬 Amines",
  "💧 Hydrogen",
  "⚛️ Atomic Structure",
  "🧲 Moving Charges",
  "∑ Sequences & Series",
  "📐 Trigonometry"
];
  return (
    <div>
      {/* <div className="division"></div> */}
      <div className="marquee">
        <div className="track">
            {[...chapters, ...chapters].map((item,index) =>(
                <span key={index} className="marquee-item">{item}</span>
            ))}
        </div>
      </div>
    </div>
  )
}

export default Moving_chapters
