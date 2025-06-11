import React from 'react'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()

  const handleNavigateToAbout = () => {
    navigate('/about')
  }

  return (
    <nav className="flex items-center justify-between p-4 px-6 md:px-14">
      <div className="border-2 bg-white px-4 py-1 text-xl font-bold text-gray-800 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        AI PillPeer
      </div>

      <div className="space-x-4 px-3 md:space-x-6">
        <button
          onClick={handleNavigateToAbout}
          className="relative font-bold text-black after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:rounded after:bg-black after:shadow-md hover:text-gray-900"
        >
          About
        </button>
      </div>
    </nav>
  )
}

export default Navbar
