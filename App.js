// src/App.js
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import QuizDashboard from './components/QuizDashboard';
import QuizCreator from './components/QuizCreator';
import QuizTaker from './components/QuizTaker';
import Results from './components/Results';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizResults, setQuizResults] = useState(null);

  const renderView = () => {
    switch (currentView) {
      case 'create':
        return <QuizCreator onBack={() => setCurrentView('dashboard')} />;
      case 'take':
        return selectedQuiz ? 
          <QuizTaker 
            quiz={selectedQuiz} 
            onComplete={(results) => {
              setQuizResults(results);
              setCurrentView('results');
            }}
            onBack={() => setCurrentView('dashboard')}
          /> : null;
      case 'results':
        return <Results results={quizResults} onBack={() => setCurrentView('dashboard')} />;
      default:
        return (
          <QuizDashboard 
            onCreateQuiz={() => setCurrentView('create')}
            onTakeQuiz={(quiz) => {
              setSelectedQuiz(quiz);
              setCurrentView('take');
            }}
          />
        );
    }
  };

  return (
    <div className="App">
      <Header 
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <div className="container mt-4">
        {renderView()}
      </div>
    </div>
  );
}

export default App;