import Bottombar from '@/components/ui/global-components/Bottombar'
import LeftSidebar from '@/components/ui/global-components/LeftSidebar'
import Topbar from '@/components/ui/global-components/Topbar'
import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className='w-full md:flex'>
      <Topbar />
      <LeftSidebar />
      <section className='flex flex-1 h-full'>
        <Outlet />
      </section>
      <Bottombar />
    </div>
  )
}

export default MainLayout