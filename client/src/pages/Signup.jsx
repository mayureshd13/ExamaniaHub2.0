import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await signup({ name, email, password });
    if (res.success) {
      navigate('/login');
    } else {
      setError(res.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-700 p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-lg shadow-lg max-w-md w-full p-8"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 font-[Caveat]">
          Create an <span className="text-amber-400">Examania Hub</span> Account
        </h2>

        {error && (
          <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col font-semibold text-gray-700">
            Name
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name"
            />
          </label>

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
              placeholder="Create a password"
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-md font-bold shadow-md hover:from-purple-700 hover:to-blue-700 transition-colors duration-300"
          >
            Sign Up
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold">
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
