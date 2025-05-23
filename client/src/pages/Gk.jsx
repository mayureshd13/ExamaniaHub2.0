import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from '../components/Footer';


function Gk() {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const questionsPerPage = 10;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_GK}`);
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        const data = await response.json();
        setQuestions(data.questions);
        setFilteredQuestions(data.questions);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions;

    if (difficulty) {
      filtered = filtered.filter(q => q.difficulty.toLowerCase() === difficulty.toLowerCase());
    }
    if (topic) {
      filtered = filtered.filter(q => q.topic.toLowerCase() === topic.toLowerCase());
    }
    if (searchQuery) {
      filtered = filtered.filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.explanation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
    setPage(1);
  }, [difficulty, topic, questions, searchQuery]);

  const handleAnswer = (qId, selectedOption, correctAnswer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: { 
        selected: selectedOption, 
        correct: correctAnswer,
        isCorrect: selectedOption === correctAnswer
      }
    }));
  };

  const resetFilters = () => {
    setDifficulty('');
    setTopic('');
    setSearchQuery('');
  };

  const topics = [...new Set(questions.map(q => q.topic))];
  const difficulties = [...new Set(questions.map(q => q.difficulty))];
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const currentQuestions = filteredQuestions.slice(
    (page - 1) * questionsPerPage,
    page * questionsPerPage
  );

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800'
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-3/4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center min-h-screen bg-gray-50 pb-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-8 flex flex-col items-center shadow-lg relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/20"></div>
          <div className="max-w-6xl w-full relative z-10">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="font-bold text-white text-4xl md:text-5xl lg:text-6xl mb-4">
                GK Practice
              </h1>
              <p className="text-white/90 text-lg md:text-xl font-medium mb-6 max-w-3xl mx-auto">
                Sharpen your skills with our curated collection of GK questions
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="w-full max-w-6xl px-4 mt-6">
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search Questions</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Topics</option>
                  {topics.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Levels</option>
                  {difficulties.map((d, i) => (
                    <option key={i} value={d.toLowerCase()}>
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {(difficulty || topic || searchQuery) && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Question List */}
        <div className="w-full max-w-6xl px-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No questions found</h3>
              <p className="text-gray-500">Try adjusting your filters or search query</p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {currentQuestions.map((q, index) => {
                const answer = selectedAnswers[q._id];
                const questionNumber = (page - 1) * questionsPerPage + index + 1;

                return (
                  <motion.div
                    key={q._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 my-4 rounded-xl shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-lg">
                        {questionNumber}. {q.question}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${difficultyColors[q.difficulty.toLowerCase()] || 'bg-gray-100'}`}>
                        {q.difficulty}
                      </span>
                    </div>
                    
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <motion.li
                          key={opt}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => !answer && handleAnswer(q._id, opt, q.answer)}
                          className={`p-3 rounded-lg cursor-pointer border transition-all ${
                            answer
                              ? opt === q.answer
                                ? 'bg-green-50 border-green-300'
                                : opt === answer.selected
                                ? 'bg-red-50 border-red-300'
                                : 'opacity-70'
                              : 'hover:bg-blue-50 hover:border-blue-300'
                          } ${answer ? 'cursor-default' : ''}`}
                        >
                          <div className="flex items-start">
                            <span className={`font-bold mr-2 ${
                              answer
                                ? opt === q.answer
                                  ? 'text-green-600'
                                  : opt === answer.selected
                                  ? 'text-red-600'
                                  : 'text-gray-400'
                                : 'text-gray-700'
                            }`}>
                              {opt}.
                            </span>
                            <span>{q.options[opt]}</span>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                    
                    {answer && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className={`font-medium mb-2 ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {answer.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                        </div>
                        <div className="text-sm text-gray-700">
                          <strong>Explanation:</strong> {q.explanation || 'No explanation provided.'}
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Pagination */}
        {filteredQuestions.length > 0 && (
          <div className="w-full max-w-6xl px-4 mt-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600">
                Showing {(page - 1) * questionsPerPage + 1} to{' '}
                {Math.min(page * questionsPerPage, filteredQuestions.length)} of{' '}
                {filteredQuestions.length} questions
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${page === pageNum ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <span className="px-2">...</span>
                  )}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`w-10 h-10 rounded-lg ${page === totalPages ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                      {totalPages}
                    </button>
                  )}
                </div>
                
                <button
                  onClick={() => setPage(p => (p * questionsPerPage < filteredQuestions.length ? p + 1 : p))}
                  disabled={page * questionsPerPage >= filteredQuestions.length}
                  className={`px-4 py-2 rounded-lg ${page * questionsPerPage >= filteredQuestions.length ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer/>
    </>
  );
}

export default Gk;