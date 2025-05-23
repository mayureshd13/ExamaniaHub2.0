import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TestPage = () => {
      const navigate = useNavigate();

  // Test configuration states
  const [testConfig, setTestConfig] = useState({
    mode: 'specific', // 'specific' or 'combined'
    subjects: [],
    marks: 20,
    duration: 30 // in minutes
  });
  
  // Test states
  const [testStarted, setTestStarted] = useState(false);
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
  
  // Calculate duration based on marks (1 minute per question)
  useEffect(() => {
    setTestConfig(prev => ({
      ...prev,
      duration: prev.marks // 1 minute per question
    }));
  }, [testConfig.marks]);

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
          submitTest(); // Auto-submit when time runs out
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
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 pb-10">
        {/* Header */}
        <div className="w-full bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Abhyaas Zone Test</h1>
          <p className="text-xl text-white/90">
            {testStarted ? 'Test in Progress' : 
             testSubmitted ? 'Test Results' : 'Configure Your Test'}
          </p>
        </div>

        {/* Test Configuration */}
        {!testStarted && !testSubmitted && (
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mt-8"
          >
            <h2 className="text-2xl font-semibold mb-6">Test Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Score Card */}
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-2">Your Score</h3>
                <div className="flex items-end">
                  <span className="text-4xl font-bold text-blue-600">{results.score}%</span>
                  <span className="ml-2 text-gray-600">({results.correct}/{results.total})</span>
                </div>
              </div>
              
              {/* Correct Answers */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-lg font-medium text-green-800 mb-2">Correct</h3>
                <span className="text-3xl font-bold text-green-600">{results.correct}</span>
              </div>
              
              {/* Incorrect Answers */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-medium text-red-800 mb-2">Incorrect</h3>
                <span className="text-3xl font-bold text-red-600">{results.incorrect}</span>
              </div>
            </div>
            
            {/* Detailed Results */}
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
            
            <div className="flex justify-center gap-2">
              <button
                onClick={resetTest}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Take Another Test
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Exit Test
              </button>

            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default TestPage;