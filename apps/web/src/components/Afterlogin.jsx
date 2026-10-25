import React from 'react'
import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const Afterlogin = () => {
  const [isAuth, setIsAuth] = useState(false)
  const [username,setUsername] = useState()
  const simpleButton = useRef();

  const logout = async () => {
    const response = await axios.get('http://localhost:3000/users/logout', {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log(response.data.message)
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users/protected', {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setUsername(response.data.username)
        setIsAuth(true);
      }
      catch (err) {
        console.log("Error in checking auth :", err.response? err.response.data.error : err.message);
        setIsAuth(false);
      }

    }
    checkAuth();
  }, [])
  return (
    <div>
      {isAuth ? (
        <div>
          <h1>Welcome to the protected page! {username}</h1>
          <p>You are authenticated.</p>
          <div className="dabba">
            <button ref={simpleButton} onClick={
              () => {
                simpleButton.current.style.backgroundColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
                simpleButton.current.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
              }
            }>Click Me</button>
            <Link to='/login'><button onClick={logout}>Logout</button></Link>
          </div>
        </div>
      ) : (
        <div>
          <h1>Access Denied</h1>
          <p>Please log in.</p>
          <Link to='/login'><button>Login</button></Link>
        </div>
      )}
    </div>
  )
}

export default Afterlogin
