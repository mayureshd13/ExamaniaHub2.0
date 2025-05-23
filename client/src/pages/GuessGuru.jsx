import { useState, useEffect } from 'react';
import { useNavigate, } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Button,
    Typography,
    Chip,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter
} from "@material-tailwind/react";

const GuessGuruPage = () => {
    const navigate = useNavigate();

    const handleGameZoneClick = () => {
        navigate("/", { state: { scrollTo: "gameZone" } });
    };



    const [gameState, setGameState] = useState({
        word: '',
        hint: '',
        category: '',
        guesses: Array(6).fill(''),
        currentGuess: '',
        currentRow: 0,
        gameOver: false,
        message: '',
        points: 0,
        streak: 0,
        maxStreak: 0,
        usedHints: 0,
        totalWords: 0,
        isLoading: true,
        error: null,
        showHelp: false
    });

    const categoryColors = {
        'Aptitude': 'bg-blue-500',
        'English': 'bg-green-500',
        'Computer Science': 'bg-purple-500',
        'Programming': 'bg-yellow-500',
        'General Knowledge': 'bg-red-500'
    };

    const fetchWord = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_WORDBANK}`);
            if (!response.ok) throw new Error('Failed to fetch word');
            return await response.json();
        } catch (error) {
            throw error;
        }

    };


    const startNewGame = async () => {
        try {
            setGameState(prev => ({
                ...prev,
                isLoading: true,
                error: null,
                message: ''
            }));

            const data = await fetchWord();

            setGameState(prev => ({
                ...prev,
                word: data.word ? data.word.toUpperCase() : '',
                hint: data.hint,
                showHint: false,
                category: data.category,
                guesses: Array(6).fill(''),
                currentGuess: '',
                currentRow: 0,
                gameOver: false,
                usedHints: 0,
                totalWords: data.totalWords,
                isLoading: false
            }));
        } catch (err) {
            setGameState(prev => ({
                ...prev,
                error: err.message,
                isLoading: false
            }));
        }
    };
    useEffect(() => {
        startNewGame();
    }, []);

    const handleKeyDown = (e) => {
        if (gameState.gameOver || gameState.isLoading) return;

        if (/^[A-Za-z]$/.test(e.key) && gameState.currentGuess.length < 5) {
            setGameState(prev => ({
                ...prev,
                currentGuess: prev.currentGuess + e.key.toUpperCase()
            }));
            return;
        }

        if (e.key === 'Backspace') {
            setGameState(prev => ({
                ...prev,
                currentGuess: prev.currentGuess.slice(0, -1)
            }));
            return;
        }

        if (e.key === 'Enter' && gameState.currentGuess.length === 5) {
            const newGuesses = [...gameState.guesses];
            newGuesses[gameState.currentRow] = gameState.currentGuess;

            const isCorrect = gameState.currentGuess === gameState.word;
            const isLastRow = gameState.currentRow === 5;

            const pointsEarned = isCorrect ?
                100 - (gameState.currentRow * 15) - (gameState.usedHints * 10) :
                0;

            const newStreak = isCorrect ? gameState.streak + 1 : 0;

            setGameState(prev => ({
                ...prev,
                guesses: newGuesses,
                currentGuess: isCorrect || isLastRow ? prev.currentGuess : '',
                currentRow: isCorrect || isLastRow ? prev.currentRow : prev.currentRow + 1,
                gameOver: isCorrect || isLastRow,
                message: isCorrect ?
                    `You won! +${pointsEarned} points` :
                    isLastRow ? `Game over! The word was ${gameState.word}` : '',
                points: isCorrect ? prev.points + pointsEarned : prev.points,
                streak: newStreak,
                maxStreak: Math.max(prev.maxStreak, newStreak),
                isLoading: false
            }));
        }
    };

    const useHint = () => {

        if (gameState.usedHints >= 1 || gameState.gameOver) return;
        setGameState(prev => ({
            ...prev,
            usedHints: prev.usedHints + 1,
            points: Math.max(0, prev.points - 10),
            showHint: true

        })

        );

    };

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [gameState.currentGuess, gameState.gameOver, gameState.isLoading]);

    useEffect(() => {
        // Load saved game state on mount
        const savedState = localStorage.getItem('guessGuruState');
        if (savedState) {
            setGameState(JSON.parse(savedState));
        }
    }, []);

    useEffect(() => {
        // Save game state whenever it changes
        localStorage.setItem('guessGuruState', JSON.stringify(gameState));
    }, [gameState]);

    const getLetterColor = (letter, position) => {
        if (!letter) return 'bg-white dark:bg-gray-800';

        const correctWord = gameState.word.toUpperCase();  // ensure uppercase
        const upperLetter = letter.toUpperCase();

        if (correctWord[position] === upperLetter) return 'bg-green-500 text-white';
        if (correctWord.includes(upperLetter)) return 'bg-yellow-500 text-white';

        return 'bg-gray-400 text-white dark:bg-gray-600';
    };


    if (gameState.error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 w-full max-w-md">
                    <Typography variant="h5" className="font-bold mb-2">Error</Typography>
                    <Typography className="mb-4">{gameState.error}</Typography>
                    <Button
                        onClick={startNewGame}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-300 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6"
        >
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <Typography variant="h2" className="font-bold text-blue-800 dark:text-blue-200 flex items-center">
                            <img src="https://res.cloudinary.com/djhweskrq/image/upload/v1747983145/ExamaniaHub_logo_.0_1_a0j9ql.png" width={60} alt="logo" />
                            Guess<span className='text-green-500'> Guru</span>
                        </Typography>
                        <div className="flex items-center gap-2 mt-2">
                            <Typography className="text-gray-700 dark:text-gray-300">
                                Guess the 5-letter word
                            </Typography>
                            {!gameState.isLoading && gameState.category && (
                                <Chip
                                    value={gameState.category}
                                    className={`${categoryColors[gameState.category] || 'bg-gray-500'} text-white`}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            onClick={() => setGameState(prev => ({ ...prev, showHelp: true }))}
                            variant="outlined"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
                        >
                            Help
                        </Button>
                        <Button
                            onClick={() => navigate('/')}
                            variant="outlined"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700"
                        >
                            Exit
                        </Button>
                    </div>
                </div>

                {/* Game Stats */}
                {!gameState.isLoading && (
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow text-center">
                            <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                                Points
                            </Typography>
                            <Typography variant="h4" className="font-bold text-blue-600 dark:text-blue-300">
                                {gameState.points}
                            </Typography>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow text-center">
                            <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                                Streak
                            </Typography>
                            <Typography variant="h4" className="font-bold text-green-600 dark:text-green-300">
                                {gameState.streak}
                            </Typography>
                        </div>
                        <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow text-center">
                            <Typography variant="small" className="text-gray-500 dark:text-gray-400">
                                Max Streak
                            </Typography>
                            <Typography variant="h4" className="font-bold text-purple-600 dark:text-purple-300">
                                {gameState.maxStreak}
                            </Typography>
                        </div>
                    </div>
                )}

                {/* Loading State */}
                {gameState.isLoading ? (
                    <div className="flex flex-col items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                        <Typography className="text-gray-600">Loading game...</Typography>
                    </div>
                ) : (
                    <>
                        {/* Hint Section */}
                        <div className="mb-6 p-4 bg-blue-100 dark:bg-gray-700 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <Typography className="font-medium text-blue-800 dark:text-blue-200">
                                        Hint : {gameState.showHint && (
                                            <span>{gameState.hint}</span>
                                        )}

                                    </Typography>
                                </div>
                                <Button
                                    size="sm"
                                    onClick={useHint}
                                    disabled={gameState.usedHints >= 1 || gameState.gameOver}
                                    className={`${gameState.usedHints >= 1 ? 'bg-gray-300' : 'bg-blue-500'} text-white`}
                                >
                                    Extra Hint (-10 pts) {gameState.usedHints}/1
                                </Button>
                            </div>
                        </div>
                        {/* Game Grid */}
                        <div className="grid grid-rows-6 gap-2 mb-6">
                            {Array.from({ length: 6 }).map((_, row) => (
                                <div key={row} className="grid grid-cols-5 gap-2">
                                    {Array.from({ length: 5 }).map((_, col) => {
                                        const isSubmittedRow = gameState.guesses[row]?.length === 5;
                                        const letter = gameState.guesses[row]?.[col] ||
                                            (row === gameState.currentRow && gameState.currentGuess[col]) || '';
                                        const bgColor = isSubmittedRow
                                            ? getLetterColor(gameState.guesses[row]?.[col], col)
                                            : 'bg-white';
                                        return (
                                            <motion.div
                                                key={col}
                                                initial={{ scale: 0.9 }}
                                                animate={{ scale: 1 }}
                                                className={`flex items-center justify-center h-14 sm:h-16 border-2 rounded-md font-bold text-2xl ${bgColor === 'bg-white'
                                                    ? 'border-gray-300 dark:border-gray-600'
                                                    : 'border-transparent'
                                                    } ${bgColor}`}
                                            >
                                                {letter}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>

                        {/* Message */}
                        {gameState.message && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg mb-6 text-center font-medium ${gameState.message.includes('won') ?
                                    'bg-green-100 text-green-800' :
                                    'bg-red-100 text-red-800'
                                    }`}
                            >
                                {gameState.message}
                            </motion.div>
                        )}

                        {/* Keyboard */}
                        <div className="mb-8">
                            <div className="flex justify-center gap-1 mb-1">
                                {'QWERTYUIOP'.split('').map(key => (
                                    <Button
                                        key={key}
                                        onClick={() => handleKeyDown({ key })}
                                        className="w-8 h-12 sm:w-10 sm:h-14 p-0 flex items-center justify-center font-bold text-blue-500 bg-indigo-100"
                                    >
                                        {key}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex justify-center gap-1 mb-1">
                                {'ASDFGHJKL'.split('').map(key => (
                                    <Button
                                        key={key}
                                        onClick={() => handleKeyDown({ key })}
                                        className="w-8 h-12 sm:w-10 sm:h-14 p-0 flex items-center justify-center font-bold text-blue-500 bg-indigo-100"
                                    >
                                        {key}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex justify-center gap-1">
                                <Button
                                    onClick={() => handleKeyDown({ key: 'Enter' })}
                                    className="h-12 sm:h-14 px-2 sm:px-4 font-bold text-blue-500 bg-indigo-100"
                                >
                                    ENTER
                                </Button>
                                {'ZXCVBNM'.split('').map(key => (
                                    <Button
                                        key={key}
                                        onClick={() => handleKeyDown({ key })}
                                        className="w-8 h-12 sm:w-10 sm:h-14 p-0 flex items-center justify-center font-bold text-blue-500 bg-indigo-100"
                                    >
                                        {key}
                                    </Button>
                                ))}
                                <Button
                                    onClick={() => handleKeyDown({ key: 'Backspace' })}
                                    className="h-12 sm:h-14 px-2 sm:px-4 font-bold text-blue-500 bg-indigo-100"
                                >
                                    ⌫
                                </Button>
                            </div>
                        </div>

                        {/* Game Controls */}
                        <div className="flex justify-center gap-4">
                            <Button
                                onClick={startNewGame}
                                className="bg-blue-600 hover:bg-blue-700 text-white "
                            >
                                New Game
                            </Button>
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    handleGameZoneClick();
                                }}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                                Game Zone
                            </Button>
                        </div>
                    </>
                )}
            </div>

            {/* Help Dialog */}
            <Dialog open={gameState.showHelp} handler={() => setGameState(prev => ({ ...prev, showHelp: false }))}>
                <DialogHeader>How to Play GuessGuru</DialogHeader>
                <DialogBody divider>
                    <Typography className="mb-4">
                        Guess the <strong>5-letter word</strong> in 6 tries. Each guess must be a valid word.
                    </Typography>
                    <Typography className="mb-2">
                        <strong>Category:</strong> The word comes from {gameState.category || 'a random category'}.
                    </Typography>
                    <Typography className="mb-4">
                        <strong>Scoring:</strong>
                    </Typography>
                    <ul className="list-disc pl-5 mb-4">
                        <li>Base points: 100</li>
                        <li>-15 points per guess used</li>
                        <li>-10 points per hint used</li>
                        <li>Bonus points for streaks</li>
                    </ul>
                    <Typography>
                        <strong>Colors:</strong>
                    </Typography>
                    <div className="flex items-center gap-2 mt-2 mb-2">
                        <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-white">A</div>
                        <span>Correct letter in correct spot</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-yellow-500 rounded flex items-center justify-center text-white">B</div>
                        <span>Correct letter in wrong spot</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-400 rounded flex items-center justify-center text-white">C</div>
                        <span>Letter not in word</span>
                    </div>
                </DialogBody>
                <DialogFooter>
                    <Button
                        variant="gradient"
                        color="blue"
                        onClick={() => setGameState(prev => ({ ...prev, showHelp: false }))}
                        className="mr-1 bg-indigo-200"
                    >
                        <span className='text-blue-500'>Got It!</span>
                    </Button>
                </DialogFooter>
            </Dialog>
        </motion.div>
    );
};

export default GuessGuruPage;