import React from 'react'
import "./Steps.css"
import { useState } from 'react'

const Steps = () => {

    const [hoveredCard, setHoveredCard] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleCardClick = (id) => {
        if (isMobile) {
            setHoveredCard(hoveredCard === id ? null : id);
        }
    };

    const stepData = [
        {
            id: 1,
            emoji: '👀',
            title: 'Pick a chapter',
            Desc: 'Choose your weak chapter from Physics, Chemistry, or Math.',
            videourl: `src/assets/Card1.mp4`
        },
        {
            id: 2,
            emoji: '🎬',
            title: 'Watch it come alive',
            Desc: 'Each concept is explained through simple animations—making concepts crystal clear. Even the toughest chapters become super easy to understand',
            videourl: `src/assets/Card2.mp4`
        },
        {
            id: 3,
            emoji: '🧩',
            title: 'Grind the problems',
            Desc: 'Every chapter links to its problem set. 1000+ questions in the Problem arena with difficulty ratings, acceptance rates, tiered hints, topics tagged, separated discussion tabs and Animated solutions.',
            videourl: `src/assets/Card3.mp4`
        },
        {
            id: 4,
            emoji: '🏆',
            title: 'Compete and rank',
            Desc: 'Join weekly contests. Earn a JEE Rating. See where you stand among serious aspirants.',
            videourl: `src/assets/Card4.mp4`
        }
    ]
    return (
        <div>
            <div className="division"></div>
            <div className="steps-container">
                <div className="steps-header">
                    <h2>How It Works?</h2>
                    <p>Four Simple Steps to actually understand JEE</p>
                </div>
                <div className="steps-content">

                    {stepData.map((step) => (
                        <div
                            key={step.id}
                            className={`step-card step-${step.id}`}
                            onMouseEnter={() => setHoveredCard(step.id)}
                            onMouseLeave={() => setHoveredCard(null)}

                        >
                            {hoveredCard === step.id ? (
                                <div className="video-container">
                                    <video width="100%" 
                                    src={step.videourl}
                                    height="auto" className='home-video' autoPlay loop muted
                                    preload="auto">
                                    </video>
                                </div>
                            ) : (
                                <>
                                    <div className="s-card-top">
                                        <div className="s-top-emoji">{step.emoji}</div>
                                        <div className="s-top-number">0{step.id}</div>
                                    </div>

                                    <div className="s-card-middle">
                                        <div className="s-middle-title">{step.title}</div>
                                        <div className="s-middle-description">{step.Desc}</div>
                                    </div>
                                    <div className="s-card-bottom"></div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Steps


{/* <div className="step-card step-1">
            <div className="s-card-top">
                <div className="s-top-emoji">👀</div>
                <div className="s-top-number">01</div>
            </div>
            <div className="s-card-middle">
                <div className="s-middle-title">Pick a chapter</div>
                <div className="s-middle-description"> Choose your weak chapter from Physics, Chemistry, or Math.</div>
            </div>
            <div className="s-card-bottom"></div>
           </div>
           <div className="step-card step-2">
            <div className="s-card-top">
                <div className="s-top-emoji">🎬</div>
                <div className="s-top-number">02</div>
            </div>
            <div className="s-card-middle">
                <div className="s-middle-title">Watch it come alive</div>
                <div className="s-middle-description">Each concept is explained through simple animations—making concepts crystal clear. Even the toughest chapters become super easy to understand</div>
            </div>
            <div className="s-card-bottom"></div>   
           </div>
           <div className="step-card step-3">
            <div className="s-card-top">
                <div className="s-top-emoji">🧩</div>
                <div className="s-top-number">03</div>
            </div>
            <div className="s-card-middle">
                <div className="s-middle-title">Grind the problems</div>
                <div className="s-middle-description">Every chapter links to its problem set. 1000+ questions in the Problem arena with difficulty ratings, acceptance rates, tiered hints, topics tagged, separated discussion tabs and Animated solutions.</div>
            </div>
            <div className="s-card-bottom"></div>
           </div>
           <div className="step-card step-4">
            <div className="s-card-top">
                <div className="s-top-emoji">🏆</div>
                <div className="s-top-number">04</div>
            </div>
            <div className="s-card-middle">
                <div className="s-middle-title">Compete and rank</div>
                <div className="s-middle-description">Join weekly contests. Earn a JEE Rating. See where you stand among serious aspirants.</div>
            </div>
            <div className="s-card-bottom"></div>
           </div> */}
