// src/components/QuizDashboard.js
import React, { useState, useEffect } from 'react';
import { storage, QUESTION_TYPES } from '../utils/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const QuizDashboard = ({ onCreateQuiz, onTakeQuiz }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    totalQuestions: 0,
    avgScore: 0,
    recentResults: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allQuizzes = storage.getAllQuizzes();
    const allResults = storage.getAllResults();
    
    let totalQuestions = 0;
    allQuizzes.forEach(q => {
      totalQuestions += q.questions.length;
    });

    // Calculate average score
    let totalScore = 0;
    let scoreCount = 0;
    allResults.forEach(r => {
      if (r.score !== undefined) {
        totalScore += r.score;
        scoreCount++;
      }
    });
    const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : 0;

    // Get recent results (last 5)
    const recentResults = allResults
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    setQuizzes(allQuizzes);
    setStats({
      totalQuizzes: allQuizzes.length,
      totalQuestions,
      avgScore,
      recentResults
    });
  };

  const handleDeleteQuiz = (id) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      storage.deleteQuiz(id);
      loadData();
    }
  };

  const getQuestionTypeCounts = () => {
    const counts = {};
    quizzes.forEach(quiz => {
      quiz.questions.forEach(q => {
        counts[q.type] = (counts[q.type] || 0) + 1;
      });
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: QUESTION_TYPES[type]?.name || type,
      count
    }));
  };

  return (
    <div className="quiz-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quiz Dashboard</h1>
        <button className="btn btn-primary" onClick={onCreateQuiz}>
          <i className="bi bi-plus-circle me-2"></i>Create New Quiz
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Quizzes</h5>
              <h2 className="card-text">{stats.totalQuizzes}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">Total Questions</h5>
              <h2 className="card-text">{stats.totalQuestions}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-info mb-3">
            <div className="card-body">
              <h5 className="card-title">Average Score</h5>
              <h2 className="card-text">{stats.avgScore}%</h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card text-white bg-warning mb-3">
            <div className="card-body">
              <h5 className="card-title">Question Types</h5>
              <h2 className="card-text">{Object.keys(QUESTION_TYPES).length}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Quiz List */}
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4>Available Quizzes</h4>
            </div>
            <div className="card-body">
              {quizzes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-journal-x display-1 text-muted"></i>
                  <p className="mt-3">No quizzes available. Create one to get started!</p>
                </div>
              ) : (
                <div className="list-group">
                  {quizzes.map(quiz => (
                    <div key={quiz.id} className="list-group-item list-group-item-action">
                      <div className="d-flex w-100 justify-content-between">
                        <div>
                          <h5 className="mb-1">{quiz.title}</h5>
                          <p className="mb-1 text-muted">{quiz.description}</p>
                          <small>
                            <span className="badge bg-secondary me-2">
                              {quiz.questions.length} questions
                            </span>
                            <span className="badge bg-info me-2">
                              {quiz.category}
                            </span>
                            <span className="badge bg-light text-dark">
                              Created: {new Date(quiz.createdAt).toLocaleDateString()}
                            </span>
                          </small>
                        </div>
                        <div className="btn-group">
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => onTakeQuiz(quiz)}
                          >
                            <i className="bi bi-play-fill"></i> Take Quiz
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteQuiz(quiz.id)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity & Stats */}
        <div className="col-md-4">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Recent Attempts</h5>
            </div>
            <div className="card-body">
              {stats.recentResults.length === 0 ? (
                <p className="text-muted">No attempts yet</p>
              ) : (
                <div className="list-group">
                  {stats.recentResults.map(result => (
                    <div key={result.id} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <span>{result.quizName}</span>
                        <span className={`badge ${result.score >= 70 ? 'bg-success' : result.score >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                          {result.score}%
                        </span>
                      </div>
                      <small className="text-muted">
                        {new Date(result.timestamp).toLocaleString()}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Question Type Distribution Chart */}
          <div className="card">
            <div className="card-header">
              <h5>Question Type Distribution</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={getQuestionTypeCounts()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizDashboard;