import {AboutPage,ComingSoon} from './components/PageSurface'
import {AuthProvider,Protected} from './lib/Auth'
import {Dashboard,Arena,Problem,AssessmentList,Attempt,Contest,Store,Admin,NotFound} from './pages/Platform/Platform'
import './App.css'
import Login from './pages/Login/Login'
import SignUp from './pages/Signup/Signup'
import Afterlogin from './components/Afterlogin'
import { Outlet, createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home/Home'
import Navbar from './components/Navbar'

import Maincomplexnumbers from './pages/Chapters/Complexnumbers/components/Maincomplexnumbers'
import ChapterCatalog from './pages/Chapters/ChapterCatalog'
// import ChapterAccessGate from './components/ChapterAccessGate';

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
        { path:'/dashboard', element:<Protected><Dashboard/></Protected> },
        { path:'/arena', element:<Protected><Arena/></Protected> },
        { path:'/arena/:id', element:<Protected><Problem/></Protected> },
        { path:'/tests', element:<Protected><AssessmentList kind="mock"/></Protected> },
        { path:'/contests', element:<Protected><AssessmentList kind="contest"/></Protected> },
        { path:'/contests/:id', element:<Protected><Contest/></Protected> },
        { path:'/attempts/:id', element:<Protected><Attempt/></Protected> },
        { path:'/admin', element:<Protected admin><Admin/></Protected> },
        { path:'/resources', element:<Protected><ChapterCatalog/></Protected> },
        { path:'*', element:<NotFound/> },
        { path: "/chapters", element: <ChapterCatalog /> },
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
          element: <Protected><Dashboard/></Protected>
        },
        {
          path: "/explore",
          element: <Protected><Arena/></Protected>
        },
        {
          path: "/store",
          element: <Protected><Store/></Protected>
        },
        {
          path: "/about",
          element: <AboutPage/>
        },
        {
          path: "/chapters/r",
          element: <ComingSoon subject="Physics" title="Rotational Motion" description="From angular motion to rolling bodies, discover the ideas that keep the world turning. Visual lessons and worked examples are on their way."/>
        },
        {
          path: "/chapters/as",
          element: <ComingSoon chemistry subject="Chemistry" title="Atomic Structure" description="Take a closer look at the building blocks of matter. Explore electrons, energy levels and the ideas behind atomic models in an upcoming chapter."/>
        },
        {
          path: "/chapters/cn",
          element: <Maincomplexnumbers />
        }
      ]
    }
  ])

  return (
    <>
      <AuthProvider><RouterProvider router={router} /></AuthProvider>
    </>
  )
}

export default App
