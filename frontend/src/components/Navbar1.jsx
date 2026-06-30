import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Navbar1() {
  const [showSignupOptions, setShowSignupOptions] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSignupOptions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="bg-green-600 text-white p-2 rounded-lg">♻</div>
        <h1 className="text-xl font-bold text-green-600">EcoCollect</h1>
      </div>

      <div className="flex gap-6 items-center">
        <Link to="/login" className="hover:text-green-600">
          Sign In
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowSignupOptions((v) => !v)}
            className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
          >
            Get Started ▾
          </button>

          {showSignupOptions && (
            <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg animate-fadeIn">
              <Link
                to="/register"
                onClick={() => setShowSignupOptions(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Signup as User
              </Link>
              <Link
                to="/collector/register"
                onClick={() => setShowSignupOptions(false)}
                className="block px-4 py-2 hover:bg-gray-100"
              >
                Signup as Collector
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar1

