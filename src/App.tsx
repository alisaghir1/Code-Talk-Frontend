import './custom.css'
import {Routes, Route } from 'react-router-dom'
import SigninForm from './authentication/forms/SigninForm'
import SignupForm from './authentication/forms/SignupForm'
import Home from './main/pages/Home'
import AuthLayout from './authentication/AuthLayout'
import MainLayout from './main/MainLayout'
import { Toaster } from "@/components/ui/toaster"
import Explore from './main/pages/Explore'
import Saved from './main/pages/Saved'
import AllUsers from './main/pages/AllUsers'
import CreatePost from './main/pages/CreatePost'
import EditPost from './main/pages/EditPost'
import PostDetails from './main/pages/PostDetails'
import Profile from './main/pages/Profile'
import UpdateProfile from './main/pages/UpdateProfile'

const App = () => {
  return (
    <main className='flex h-screen'>
      <Routes>

        <Route element={<AuthLayout />}>
        <Route path='sign-in' element={<SigninForm />} />
        <Route path='sign-up' element={<SignupForm />} />
        </Route>

        <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path='/explore' element={<Explore />} />
        <Route path='/saved' element={<Saved />} />
        <Route path='/all-users' element={<AllUsers />} />
        <Route path='/create-post' element={<CreatePost />} />
        <Route path='/update-post/:id' element={<EditPost />} />
        <Route path='/posts/:id' element={<PostDetails />} />
        <Route path='/profile/:id/*' element={<Profile />} />
        <Route path='/update-profile/:id' element={<UpdateProfile />} />
        <Route path='/update-profile/:id' element={<UpdateProfile />} />

        </Route>
        
        <Route />
      </Routes>
      <Toaster />
    </main>
  )
}

export default App