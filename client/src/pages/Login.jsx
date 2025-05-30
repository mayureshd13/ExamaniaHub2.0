import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { FaHome } from "react-icons/fa";


function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/'); // redirect after login success
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <>


      <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700 p-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className='flex items-center justify-center'>
            <span className='font-bold font-serif flex text-white items-center gap-2'><FaHome />Home </span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-lg max-w-md w-full p-8"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 font-[Caveat]">
            Examania <span className="text-amber-400">Hub</span> Login
          </h2>

          {error && (
            <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col font-semibold text-gray-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </label>

            <label className="flex flex-col font-semibold text-gray-700">
              Password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </label>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-md font-bold shadow-md hover:from-purple-700 hover:to-blue-700 transition-colors duration-300"
            >
              Login
            </motion.button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-semibold">
              Register here
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );

}

export default Login;
