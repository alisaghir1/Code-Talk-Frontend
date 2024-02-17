import './custom.css'
import {Routes, Route } from 'react-router-dom'
import SigninForm from './authentication/forms/SigninForm'
import SignupForm from './authentication/forms/SignupForm'
import Home from './main/pages/Home'
import AuthLayout from './authentication/AuthLayout'
import MainLayout from './main/MainLayout'

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
        </Route>
        
        <Route />
      </Routes>

    </main>
  )
}

export default App