import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import "../App.css"

const TestPage = () => {

  // User details state
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });

  // Test configuration states
  const [testConfig, setTestConfig] = useState({
    mode: 'specific',
    subjects: [],
    marks: 20,
    duration: 30
  });
  
  // Test states
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUserForm, setShowUserForm] = useState(true);

  // Available subjects
  const allSubjects = [
    { id: 'aptitude', name: 'Aptitude' },
    { id: 'logical', name: 'Logical Reasoning' },
    { id: 'computer', name: 'Computer' },
    { id: 'programming', name: 'Programming' },
    { id: 'verbal', name: 'Verbal Ability' },
    { id: 'gk', name: 'General Knowledge' }
  ];

  // Marks options
  const marksOptions = [20, 30, 50, 100];
  
  useEffect(() => {
    setTestConfig(prev => ({
      ...prev,
      duration: prev.marks
    }));
  }, [testConfig.marks]);

  // Handle user details change
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle subject selection
  const handleSubjectChange = (subjectId) => {
    setTestConfig(prev => {
      if (prev.subjects.includes(subjectId)) {
        return {
          ...prev,
          subjects: prev.subjects.filter(id => id !== subjectId)
        };
      } else {
        return {
          ...prev,
          subjects: [...prev.subjects, subjectId]
        };
      }
    });
  };

  // Start the test
  const startTest = async () => {
    if (testConfig.mode === 'specific' && testConfig.subjects.length === 0) {
      setError('Please select at least one subject');
      return;
    }

    if (testConfig.mode === 'combined' && testConfig.subjects.length < 2) {
      setError('Please select at least two subjects for combined test');
      return;
    }

    if (!userDetails.name) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let selectedQuestions = [];

      if (testConfig.mode === 'specific') {
        const promises = testConfig.subjects.map(subject =>
          fetch(`${import.meta.env.VITE_QUESTIONS}${subject}`)
        );
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(res => res.json()));

        const allQuestions = data.flatMap(d => d.questions);
        const shuffled = allQuestions.sort(() => 0.5 - Math.random());
        selectedQuestions = shuffled.slice(0, testConfig.marks);

      } else {
        const response = await fetch(`${import.meta.env.VITE_COMBINED}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjects: testConfig.subjects,
            count: testConfig.marks
          }),
        });

        const data = await response.json();
        const shuffled = data.questions.sort(() => 0.5 - Math.random());
        selectedQuestions = shuffled.slice(0, testConfig.marks);
      }

      setQuestions(selectedQuestions);
      setTimeLeft(testConfig.duration * 45);
      setTestStarted(true);
      setShowUserForm(false);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (!testStarted || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [testStarted, timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle answer selection
  const handleAnswerSelect = (qId, option) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  // Submit test
  const submitTest = () => {
    setTestSubmitted(true);
    setTestStarted(false);
  };

  // Calculate results
  const calculateResults = () => {
    if (!testSubmitted) return null;
    
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    
    questions.forEach(q => {
      if (selectedAnswers[q._id]) {
        if (selectedAnswers[q._id] === q.answer) {
          correct++;
        } else {
          incorrect++;
        }
      } else {
        unanswered++;
      }
    });
    
    const score = (correct / questions.length) * 100;
    
    return {
      correct,
      incorrect,
      unanswered,
      score: score.toFixed(2),
      total: questions.length
    };
  };

  const results = calculateResults();

  // Reset test
  const resetTest = () => {
    setTestStarted(false);
    setTestSubmitted(false);
    setQuestions([]);
    setSelectedAnswers({});
    setTimeLeft(0);
    setShowUserForm(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pb-10">
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">ExamaniaHub Test</h1>
          <p className="text-xl text-white/90">
            {testStarted ? 'Test in Progress' : 
             testSubmitted ? 'Test Results' : 'Configure Your Test'}
          </p>
        </div>

        {/* User Details Form */}
        {showUserForm && !testStarted && !testSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Enter Your Details</h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={userDetails.name}
                  onChange={handleUserDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userDetails.email}
                  onChange={handleUserDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userDetails.phone}
                  onChange={handleUserDetailsChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <button
              onClick={() => setShowUserForm(false)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Continue to Test Configuration
            </button>
          </motion.div>
        )}

        {/* Test Configuration */}
        {!showUserForm && !testStarted && !testSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Test Configuration</h2>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                {error}
              </div>
            )}
            
            {/* Test Mode Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Test Mode</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setTestConfig(prev => ({ ...prev, mode: 'specific' }))}
                  className={`px-4 py-2 rounded-lg ${testConfig.mode === 'specific' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Specific Subject
                </button>
                <button
                  onClick={() => setTestConfig(prev => ({ ...prev, mode: 'combined' }))}
                  className={`px-4 py-2 rounded-lg ${testConfig.mode === 'combined' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Combined Subjects
                </button>
              </div>
            </div>
            
            {/* Subject Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">
                {testConfig.mode === 'specific' ? 'Select Subject(s)' : 'Select Subjects to Combine'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allSubjects.map(subject => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectChange(subject.id)}
                    className={`p-3 rounded-lg border ${testConfig.subjects.includes(subject.id) ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300'}`}
                  >
                    {subject.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Marks Selection */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Test Marks</h3>
              <div className="flex gap-3">
                {marksOptions.map(mark => (
                  <button
                    key={mark}
                    onClick={() => setTestConfig(prev => ({ ...prev, marks: mark }))}
                    className={`px-4 py-2 rounded-lg ${testConfig.marks === mark ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                  >
                    {mark} Questions
                  </button>
                ))}
              </div>
            </div>
            
            {/* Duration Display */}
            <div className="mb-6 p-4 bg-gray-100 rounded-lg">
              <p className="font-medium">Test Duration: <span className="text-blue-600">{testConfig.duration} minutes</span></p>
              <p className="text-sm text-gray-600">(45 second per question)</p>
            </div>
            
            {/* Start Button */}
            <button
              onClick={startTest}
              disabled={isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {isLoading ? 'Preparing Test...' : 'Start Test'}
            </button>
          </motion.div>
        )}
        
        {/* Test Interface */}
        {testStarted && (
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Test in Progress</h2>
              <div className="text-xl font-bold bg-red-100 text-red-700 px-4 py-2 rounded-lg">
                Time Left: {formatTime(timeLeft)}
              </div>
            </div>
            
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(questions.length - Object.keys(selectedAnswers).length) / questions.length * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {Object.keys(selectedAnswers).length} of {questions.length} questions answered
              </p>
            </div>
            
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={q._id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-lg">
                      Q{index + 1}. {q.question}
                    </h3>
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                      {q.topic}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleAnswerSelect(q._id, opt)}
                        className={`p-3 text-left rounded-lg border ${selectedAnswers[q._id] === opt ? 'bg-blue-100 border-blue-500' : 'bg-gray-50 border-gray-300 hover:bg-gray-100'}`}
                      >
                        <span className="font-bold mr-2">{opt}.</span>
                        {q.options[opt]}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={submitTest}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Submit Test
              </button>
            </div>
          </div>
        )}
        
        {/* Test Results */}
        {testSubmitted && results && (
          <div className="max-w-4xl mx-auto">
            {/* Shareable Report Card */}
            <div id="report-card" className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-blue-100">
              {/* Certificate Header */}
<div className="bg-[linear-gradient(to_right,#2563eb,#7c3aed)] py-6 px-8 text-center">
                <h2 className="text-3xl font-bold text-white mb-1">ExamaniaHub</h2>
                <h3 className="text-xl text-white/90 font-medium">Test Completion Certificate</h3>
              </div>
              
              {/* Certificate Body */}
              <div className="p-8">
                {/* User Info */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <p className="text-lg text-gray-600 mb-1">This certificate is awarded to</p>
                    <p className="text-3xl font-bold text-blue-700">{userDetails.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Certificate ID</p>
                    <p className="font-mono font-bold text-blue-600">
                      {Math.random().toString(36).substring(2, 10).toUpperCase()}
                    </p>
                  </div>
                </div>
                
                {/* Score Display */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 text-center border border-blue-100">
                  <div className="inline-block bg-white rounded-full p-3 shadow-md -mt-14 mb-4">
                    <div className="bg-blue-100 rounded-full p-4">
                      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-5xl font-bold text-blue-600 my-3">{results.score}%</p>
                  <p className="text-lg text-gray-700">
                    Scored {results.correct} out of {results.total} questions
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Test Date: {new Date().toLocaleDateString()}</p>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg text-center border border-green-100">
                    <p className="text-sm text-green-600 font-medium">Correct</p>
                    <p className="text-2xl font-bold text-green-700 mt-1">{results.correct}</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center border border-red-100">
                    <p className="text-sm text-red-600 font-medium">Incorrect</p>
                    <p className="text-2xl font-bold text-red-700 mt-1">{results.incorrect}</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center border border-yellow-100 flex flex-col items-center">
                    <p className="text-sm text-yellow-600 font-medium">Unanswered</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">{results.unanswered}</p>
                  </div>
                </div>
                
                {/* Subjects */}
                {testConfig.subjects.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">Test Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {testConfig.subjects.map(subjectId => {
                        const subject = allSubjects.find(s => s.id === subjectId);
                        return (
                          <span key={subjectId} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {subject?.name || subjectId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Footer */}
                <div className="border-t pt-4 text-center">
                  <p className="text-xs text-gray-500">
                    This certificate verifies that {userDetails.name} has completed the test on ExamaniaHub.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Detailed Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md p-6 mb-8 mt-6"
            >
              <h2 className="text-2xl font-semibold mb-6">Detailed Results</h2>
              
              <div className="mb-6">
                <h3 className="text-xl font-medium mb-4">Question-wise Results</h3>
                <div className="space-y-4">
                  {questions.map((q, index) => {
                    const userAnswer = selectedAnswers[q._id];
                    const isCorrect = userAnswer === q.answer;
                    
                    return (
                      <div key={q._id} className="border-b pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            Q{index + 1}. {q.question}
                          </h4>
                          <span className={`text-xs px-2 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                          {['A', 'B', 'C', 'D'].map(opt => {
                            let bgClass = 'bg-gray-50';
                            if (opt === q.answer) {
                              bgClass = 'bg-green-100 border-green-300';
                            } else if (opt === userAnswer && !isCorrect) {
                              bgClass = 'bg-red-100 border-red-300';
                            }
                            
                            return (
                              <div 
                                key={opt}
                                className={`p-3 rounded-lg border ${bgClass}`}
                              >
                                <span className="font-bold mr-2">{opt}.</span>
                                {q.options[opt]}
                              </div>
                            );
                          })}
                        </div>
                        
                        {!isCorrect && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <p className="font-medium text-blue-800">Correct Answer: {q.answer}</p>
                            <p className="text-sm text-gray-700 mt-1">
                              <span className="font-medium">Explanation:</span> {q.explanation || 'No explanation provided.'}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
            
            {/* Sharing Options */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <button
                  onClick={resetTest}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retake Test
                </button>
              </div>
            </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default TestPage;