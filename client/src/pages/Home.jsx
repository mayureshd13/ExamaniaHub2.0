import { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Button,
} from "@material-tailwind/react";


const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

function Home() {
  // Using Pexels free-to-use images
  const cards = [
    {
      title: "Aptitude",
      image: import.meta.env.VITE_IMAGE_APTITUDE,
      description: "Master quantitative aptitude with our comprehensive question bank and practice tests.",
      route: "/aptitude"
    },
    {
      title: "Logical Reasoning",
      image: import.meta.env.VITE_IMAGE_LOGICAL,
      description: "Enhance your problem-solving skills with puzzles, patterns, and logical challenges.",
      route: "/logical-reasoning"
    },
    {
      title: "Verbal Ability",
      image: import.meta.env.VITE_IMAGE_VERBAL,
      description: "Improve your English comprehension, grammar, and vocabulary for competitive exams.",
      route: "/verbal-ability"
    },
    {
      title: "Computer Science",
      image: import.meta.env.VITE_IMAGE_CS,
      description: "Learn computer fundamentals, operating systems, networking, and more.",
      route: "/computer-science"
    },
    {
      title: "General Knowledge",
      image: import.meta.env.VITE_IMAGE_GK,
      description: "Stay updated with current affairs, history, geography, and important facts.",
      route: "/general-knowledge"
    },
    {
      title: "Programming",
      image: import.meta.env.VITE_IMAGE_PROGRAMMING,
      description: "Practice coding problems in Python, Java, C++ and prepare for technical interviews.",
      route: "/programming"
    },
  ];

  const games = [
    {
      id: 'guessguru',
      title: "GuessGuru",
      description: "Guess the hidden word in 6 tries. Each guess must be a valid word.",
      icon: "🔠",
      route: "/guessguru"
    },
    {
      id: 'quiz',
      title: "Quiz Challenge",
      description: "Test your knowledge with timed quizzes on various subjects.",
      icon: "🧠",
    },
    {
      id: 'flashcards',
      title: "Flashcards",
      description: "Memorize important concepts with our interactive flashcards.",
      icon: "📚",
    },
  ];

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollTo === "gameZone") {
      const el = document.querySelector("#gameZone");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);


  return (
    <>
      <Navbar />
      <main className='flex flex-col items-center mt-3 px-4 sm:px-6'>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-7xl min-h-[300px] bg-gradient-to-r from-blue-600 to-purple-600 p-6 sm:p-8 rounded-2xl flex flex-col justify-center items-center shadow-lg relative overflow-hidden my-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/20"></div>
          <div className="text-center max-w-4xl relative z-10">
            <motion.h2
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="font-bold text-white text-4xl sm:text-5xl lg:text-6xl mb-4"
            >
              Unlock Your Potential
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-white/90 text-lg sm:text-xl font-medium mb-6 mx-auto"
            >
              Learn, play, and prepare for exams with simple tools made just for you!
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 hover:shadow-md font-bold px-6 sm:px-8 py-3 rounded-full transition-all duration-300"
              >
                Explore Tutorials
              </Button>
            </motion.div>
            <p className="text-sm text-white mt-2 italic">
              *Tutorials will be available in future updates. Stay tuned!
            </p>
          </div>
        </motion.div>

        {/* Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl my-8"
        >
          {cards.map((card, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="w-full h-full max-h-[500px] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col">
                <CardHeader
                  floated={false}
                  shadow={false}
                  color="transparent"
                  className="relative h-48 sm:h-56 m-0 overflow-hidden rounded-t-2xl"
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-full w-full object-cover object-center"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/10" />
                </CardHeader>

                <CardBody className="flex-grow">
                  <Typography variant="h5" color="blue-gray" className="mb-2 font-bold">
                    {card.title}
                  </Typography>
                  <Typography className="text-gray-700">
                    {card.description}
                  </Typography>
                </CardBody>

                <CardFooter className="pt-0">
                  <Link to={card.route}>
                    <Button
                      fullWidth
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 rounded-lg transition-all duration-300"
                    >
                      Start Practicing
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Game Zone Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="w-full max-w-7xl my-12 p-6 sm:p-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl shadow-md"
        >
          <div className="text-center mb-8" id='gameZone'>
            <Typography variant="h3" color="blue-gray" className="font-bold mb-2">
              Game Zone
            </Typography>
            <Typography className="text-gray-700 max-w-2xl mx-auto">
              Learning is more fun when it's interactive! Try our educational games to reinforce concepts.
            </Typography>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.map((game) => (
              <Link to={game.route} key={game.id}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="text-4xl mb-4">{game.icon}</div>
                  <Typography variant="h5" color="blue-gray" className="font-bold mb-2">
                    {game.title}
                  </Typography>
                  <Typography className="text-gray-700 mb-4">
                    {game.description}
                  </Typography>
                  <Button
                    ripple={false}
                    fullWidth
                    className="bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 transition-all"
                  >
                    Play Now
                  </Button>
                </motion.div>
              </Link>
            ))}
          </div>
          <p className="text-sm text-yellow-800 bg-yellow-100 px-4 py-2 rounded-md mt-4">
            <strong>Note:</strong> Currently, only <span className="font-semibold">GuessGuru</span> is active to play. Other games will be activated in future updates.
          </p>
        </motion.div>
      </main>
      <Footer />
    </>

  );
}

export default Home;