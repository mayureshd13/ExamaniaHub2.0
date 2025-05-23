import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../App.css';
import { FaHome } from "react-icons/fa";
import { FaBookOpen } from "react-icons/fa";
import { IoGameController } from "react-icons/io5";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleGameZoneClick = () => {
    if (location.pathname === "/") {
      const el = document.querySelector("#gameZone");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/", { state: { scrollTo: "gameZone" } });
    }
    setIsMenuOpen(false); // close mobile menu if open
  };

  const navItems = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Tests", icon: <FaBookOpen />, path: "/tests" },
    { name: "Game Zone", icon: <IoGameController />, isGameZone: true },
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className='bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2.5 w-full shadow-md sticky top-0 z-50 font-bold'>
        <div className='container mx-auto flex justify-between items-center'>
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className='flex items-center'
          >
            <Link to="/" className='flex items-center'>
              <span className='flex justify-center items-center text-2xl font-bold font-[Caveat]'>
                <img src="https://res.cloudinary.com/djhweskrq/image/upload/v1747983145/ExamaniaHub_logo_.0_1_a0j9ql.png" width={55} alt="logo" />
               <span className='font-bold font-serif flex'>Examania <h3 className='text-amber-300'>Hub</h3> </span>
              </span>
            </Link>
          </motion.div>

          {/* Desktop Menu */}
          <ul className='hidden md:flex gap-6 items-center'>
            {navItems.map((item, index) => (
              <motion.li
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='relative'
              >
                {item.isGameZone ? (
                  <a
                    href="#gameZone"
                    onClick={(e) => {
                      e.preventDefault();
                      handleGameZoneClick();
                    }}
                    className='px-3 py-2 hover:text-red-300 transition-colors duration-200 flex gap-3 items-center'
                  >
                    {item.icon} {item.name}
                  </a>
                ) : (
                  <Link
                    to={item.path}
                    className='px-3 py-2 hover:text-red-300 transition-colors duration-200 flex gap-3 items-center'
                  >
                    {item.icon} {item.name}
                    <motion.span
                      className='absolute bottom-0 left-0 w-full h-0.5 bg-white'
                      initial={{ scaleX: 0 }}
                      whileHover={{ scaleX: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </Link>
                )}
              </motion.li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <div className='md:hidden'>
            <button
              onClick={toggleMenu}
              className='text-white focus:outline-none'
              aria-label='Toggle menu'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                {isMenuOpen ? (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                ) : (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className='md:hidden bg-blue-700 mt-2 rounded-lg shadow-lg'
          >
            <ul className='flex flex-col p-2'>
              {navItems.map((item, index) => (
                <motion.li
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  className='border-b border-blue-600 last:border-0'
                >
                  {item.isGameZone ? (
                    <a
                      href="#gameZone"
                      onClick={(e) => {
                        e.preventDefault();
                        handleGameZoneClick();
                      }}
                      className='block px-4 py-3 hover:bg-blue-600 rounded transition-colors'
                    >
                      {item.name}
                    </a>
                  ) : (
                    <Link
                      to={item.path}
                      className='block px-4 py-3 hover:bg-blue-600 rounded transition-colors'
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </nav>
    </>
  );
}

export default Navbar;
