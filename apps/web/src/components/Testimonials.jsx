import React from 'react'
import "./Testimonials.css"

const Testimonials = () => {

    const testimonials = [
        {
            id: 1,
            name: "Rohan Gupta",
            topicTagged: "Visual Learning",
            JeeRating: 1680,
            quote: "My JEE Rating went from 1200 to 1680 in 4 months. Every Sunday at 8 PM I join the contest — it's like a ritual now. The Elo system is genius. When my rating drops after a bad week, I feel it personally. It made me consistent in a way no coaching center ever did.",
            colorTheme: "green"
            
        },
        {
            id: 2,
            name: "Ananya Singh",
            topicTagged: "Concept Depth",
            JeeRating: 1725,
            quote: "Every teacher said just memorise the reactions. This platform showed me the electrons actually moving — which atom attacks, which bond breaks, why. I stopped memorising and started predicting. In the exam, there was a reaction I had never seen. I got it right because I understood the logic",
            colorTheme: "blue"
        },
        {
            id: 3,
            name: "Vikram Patel",
            topicTagged: "Problem Arena",
            JeeRating: 1750,
            quote: "The problem arena is a game-changer. It contains over 1,000 top-tier JEE-level problems. I used to get stuck on simple questions for hours, but the hint system saved me. There is also a great community of learners in the discussion section of every problem. The animated solutions are truly unique and completely different from traditional methods. With so many high-quality questions to practice, I actually stopped using my coaching modules. My JEE rating shot up from 1500 to 1750 in just a few months!",
            colorTheme: "green"
        },
        {
            id: 4,
            name: "Sneha Reddy",
            topicTagged: "Concept Animation",
            JeeRating: 1600,
            quote: "Chemical bonding was my nightmare. I watched the hybridisation animation here at 11 PM, paused on each step, and by midnight I had it. The next day I solved 8 related problems without hints. I genuinely cried. This is what education should feel like.",
            colorTheme: "orange"
        },
        {
            id: 5,
            name: "Rinshu Singh",
            topicTagged: "Credit System",
            JeeRating: 1650,
            quote: "I only wanted to learn a few chapters, not the whole syllabus. The credit system is perfect for me! I bought credits for just the chapters I needed, and it was so affordable—I spent only ₹10 and scored 40 marks from those chapters. I wish I had this when I started my JEE prep.",
            colorTheme: "blue"
        },
        {
            id: 6,
            name: "Krish Kapoor",
            topicTagged: "Weekly Contests",
            JeeRating: 1700,
            quote: "The weekly contests are intense and fun. They simulate the real JEE environment perfectly, which is completely different from regular coaching mock tests. You can truly feel the national competitive level. There is always motivation to increase your rating and climb the leaderboard. It’s addictive in a good way!",
            colorTheme: "red"
        },
    ]
    return (
        <div>
            <div className="division"></div>
            <div className="t-container">
                <div className="t-heading">
                    <h2>Stories from Our Learners</h2>
                    <p>Real journeys. Real transformations. See how PencilCopy is changing the game for JEE aspirants.</p>
                </div>
                <div className="t-cards-container">
                    {testimonials.map((testimonial) => (
                        <div className={`t-card t-${testimonial.colorTheme}`} key={testimonial.id}>
                            <div className="t-card-content">
                                <div className={`t-topic t-topic-${testimonial.colorTheme}`}>{testimonial.topicTagged}</div>
                                <p className="t-quote">"{testimonial.quote}"</p>
                                <div className="t-card-footer">
                                    <h3 className="t-name">{testimonial.name}</h3>
                                    <p className="t-rating">JEE Rating: {testimonial.JeeRating}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Testimonials
