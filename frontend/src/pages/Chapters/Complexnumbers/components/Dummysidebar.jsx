import React from 'react'
import {useState} from 'react'

const Dummysidebar = ({ onTopicSelect, modules = [] }) => {
    const topics = modules.map(
        module => module.shortTitle || module.title
    );
    const [open] = useState(true)

    const [activeIndex, setActiveIndex] = useState(0)

    const handleClick =  (index) => {
        setActiveIndex(index)
        onTopicSelect(index)
    }

    return (
        <div>
            <div className={`sidebar h-full bg-slate-950 flex flex-col ${open?"w-full":"w-0 overflow-hidden"} shrink-0 transition-all duration-300`}>
                <div className="sidebar-head flex flex-nowrap items-center justify-between border-gray-300 border-b-2 p-3 pb-4 m-0.5">
                    <h2 className="font-['poppins'] font-bold text-white text-[20px] overflow-hidden text-nowrap">Complex Numbers</h2>
                    {/* <button className="bg-slate-950 hover:bg-slate-700 text-white rounded p-1 cursor-pointer px-3"  onClick={() => setOpen(!open)} >X</button> */}
                </div>
                <div className="sidebar-content">
                    <ul>
                        {topics.map((topic, index) => (
                            <div key={index} className={`sidebar-item p-2 m-2 rounded  text-white  cursor-pointer  ${activeIndex === index ? 'bg-slate-600 hover:bg-slate-600' : 'bg-slate-800 hover:bg-slate-700'} transition-all duration-80`} onClick={() => handleClick(index)}>
                                <li className="flex gap-4 font-[sans-serif]" >
                                    <div className="serialnum">{index + 1 < 10 ? `0${index + 1}` : index + 1}</div>
                                    <div className="topicname">{topic}</div>
                                </li>
                            </div>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default Dummysidebar
