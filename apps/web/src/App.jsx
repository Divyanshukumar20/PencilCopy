import { useState } from 'react'
import './App.css'
import Login from './pages/Login/Login'
import SignUp from './pages/Signup/Signup'
import Afterlogin from './components/Afterlogin'
import { Outlet, createBrowserRouter, Router, RouterProvider, Link } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar'
import { h1 } from 'framer-motion/client'
import ComplexNumber from './components/complexnumber'

const MainLayout = () => (
  <>
    <Navbar />
    <Outlet />
  </>
)

function App() {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <MainLayout />,
      children: [
        {
          path: "/",
          element: <Home />
        },
        {
          path: "/login",
          element: <Login />
        },
        {
          path: "/signup",
          element: <SignUp />
        },
        {
          path: "/afterLogin",
          element: <Afterlogin />
        },
        {
          path: "/explore",
          element: <h1>Explore Page</h1>
        },
        {
          path: "/store",
          element: <h1>Store Page</h1>
        },
        {
          path: "/about",
          element: <h1>About Page</h1>
        },
        {
          path: "/chapter/r",
          element: <h1>Rotational Motion</h1>
        },
        {
          path: "/chapter/as",
          element: <h1>Atomic Structure</h1>
        },
        {
          path: "/chapter/cn",
          element: <ComplexNumber/>
        }
      ]
    }
  ])

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
