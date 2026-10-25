import React, { use } from 'react'
import { useState, useRef, useEffect } from 'react'
import './Navbar.css'
import { NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { div } from 'framer-motion/client'


const Navbar = () => {
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Resources', path: '/resources' },
    { name: 'Store', path: '/store' },
    { name: 'About', path: '/about' },
  ]
  const containerref = useRef(null)
  const underllineRef = useRef(null)
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)
  const hamburgerRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      document.querySelector('.brgt').classList.add('top-burger')
      document.querySelector('.brgb').classList.add('bottom-burger')
    }
    else {
      document.querySelector('.brgt').classList.remove('top-burger')
      document.querySelector('.brgb').classList.remove('bottom-burger')
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOuside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target) && !hamburgerRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOuside)
    document.addEventListener('scroll', handleClickOuside)
    return () => {
      document.removeEventListener('mousedown', handleClickOuside)
      document.removeEventListener('scroll', handleClickOuside)
    }
  }, [])

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }
  const moveunderlinetodefault = () => {
    navItems.map((item, index) => {
      if (item.path === location.pathname) {
        const realItem = containerref.current.children[index]
        underlineSlide(realItem)
      }
    })
  }

  // const dummychecker = (e) => {
  //   console.log('dummy button hovered')
  //   console.log(window.scrollY)
  //   console.log(window.pageYOffset)
  //   console.log(document.documentElement.scrollHeight)
  //   console.log(document.documentElement.clientHeight)

  // }
  // const dummycheckerout = (e) => {
  //   console.log('dummy button unhovered')

  // }
  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const curScroll = window.scrollY;
      const navbar = document.querySelector('.Navbar');
      const topElement = document.querySelector('.top');

      // Hide top bar on scroll down, show on scroll up
      if (curScroll >= lastScroll) {
        if (topElement) topElement.style.top = '-100px';
      } else {
        if (topElement) topElement.style.top = '0';
        if (navbar) navbar.classList.add('active');
      }

      // Reset when at the very top
      if (curScroll === 0) {
        if (navbar) navbar.classList.remove('active');
      }

      lastScroll = curScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  useEffect(() => {
    moveunderlinetodefault();
  }, [location.pathname])


  const underlineSlide = (item) => {
    const lpoc = containerref.current.getBoundingClientRect().left;
    const lpoi = item.getBoundingClientRect().left;
    const left = lpoi - lpoc
    const width = item.offsetWidth
    underllineRef.current.style.width = `${width}px`
    underllineRef.current.style.left = `${left}px`
    underllineRef.current.style.opacity = 1
  }
  const handlemouseenter = (e) => {
    const hoveritem = e.target
    underlineSlide(hoveritem)
  }

  const handlemouseleave = () => {
    moveunderlinetodefault()
  }

  return (
    <>
      <div className="top">
        <div className='Navbar'>

          <div className="nav-left">
            <NavLink to='/' className='nav-logo'>PencilCopy</NavLink>
          </div>

          <div className="nav-right">
            <div className="nav-items" ref={containerref} onMouseLeave={handlemouseleave}>
              {
                navItems.map((item, index) => {
                  return (
                    <NavLink to={item.path} key={index} className='nav-item' onMouseEnter={handlemouseenter}> {item.name} </NavLink>
                  )
                })
              }
              <div className="nav-underline" ref={underllineRef}></div>
            </div>
            <div className="nav-buttons">
              <NavLink to='/signup'><button className='nav-btn btn-signup golden-shine-button'><span>SignUp</span></button></NavLink>
              <NavLink to='/login'><button className='nav-btn btn-login neon-login-button'>LogIn</button></NavLink>
            </div>

            <div className="nav-dropdown">
              <div className="hamburger" onClick={toggleDropdown} ref={hamburgerRef}>
                <svg
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect className="brgt" x="10" y="20" width="40" height="6" rx="3" fill="#00fff7" />

                  <rect className="middle-burger" x="5" y="47" width="90" height="6" rx="3" fill="#00fff7" />

                  <rect className="brgb" x="35" y="74" width="50" height="6" rx="3" fill="#00fff7" />
                </svg>
              </div>
            </div>
          </div>

          <div className={` mobile-menu ${isOpen ? 'open' : 'closed'}`} ref={menuRef}>
            {navItems.map((item, index) => {
              return (
                <NavLink to={item.path} key={index} className="mob-item">{item.name}</NavLink>
              )
            })}
            <div className="mobile-auth-buttons">
              <NavLink to="/signup" className="mobile-signup">Sign Up</NavLink>
              <NavLink to="/login" className="mobile-login">Log In</NavLink>
            </div>
          </div>

        </div>
        {/* <button className="dummy-button" onMouseEnter={dummychecker} onMouseLeave={dummycheckerout}>hover me</button> */}
      </div>
    </>
  )
}

export default Navbar
