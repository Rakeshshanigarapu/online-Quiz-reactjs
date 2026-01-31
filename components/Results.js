// src/components/Results.js
import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Results = ({ results, onBack }) => {
  const [allResults, setAllResults] = useState([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const storedResults = storage.getAllResults();
    setAllResults(storedResults);
  }, []);

  const getPerformanceData = () => {
    const scores = allResults.map(r => r.score);
    return {
      average: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0,
      highest: scores.length > 0 ? Math.max(...scores) : 0,
      lowest: scores.length > 0 ? Math.min(...scores) : 0,
      totalAttempts: allResults.length
    };
  };

  const getChartData = () => {
    const scoreRanges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    };

    allResults.forEach(result => {
      const score = result.score;
      if (score >= 90) scoreRanges['90-100']++;
      else if (score >= 80) scoreRanges['80-89']++;
      else if (score >= 70) scoreRanges['70-79']++;
      else if (score >= 60) scoreRanges['60-69']++;
      else scoreRanges['Below 60']++;
    });

    return {
      labels: Object.keys(scoreRanges),
      datasets: [
        {
          label: 'Number of Attempts',
          data: Object.values(scoreRanges),
          backgroundColor: [
            '#4CAF50',
            '#8BC34A',
            '#FFC107',
            '#FF9800',
            '#F44336'
          ]
        }
      ]
    };
  };

  const getDoughnutData = () => {
    const correct = results?.correctAnswers || 0;
    const incorrect = results?.totalQuestions - correct;
    
    return {
      labels: ['Correct', 'Incorrect'],
      datasets: [
        {
          data: [correct, incorrect],
          backgroundColor: ['#36A2EB', '#FF6384'],
          hoverBackgroundColor: ['#36A2EB', '#FF6384']
        }
      ]
    };
  };

  const performance = getPerformanceData();
  const chartData = getChartData();
  const doughnutData = getDoughnutData();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="results">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quiz Results</h1>
        <button className="btn btn-outline-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      {/* Current Result */}
      {results && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Latest Attempt: {results.quizName}</h4>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-3">
                <div className="display-1 fw-bold" style={{ 
                  color: results.score >= 70 ? '#28a745' : results.score >= 50 ? '#ffc107' : '#dc3545' 
                }}>
                  {results.score}%
                </div>
                <p className="text-muted">Overall Score</p>
              </div>
              <div className="col-md-3">
                <div className="display-4 fw-bold">{results.correctAnswers}/{results.totalQuestions}</div>
                <p className="text-muted">Correct Answers</p>
              </div>
              <div className="col-md-3">
                <div className="display-4 fw-bold">{formatTime(results.timeSpent)}</div>
                <p className="text-muted">Time Spent</p>
              </div>
              <div className="col-md-3">
                <div className="display-4 fw-bold">
                  {new Date(results.timestamp).toLocaleDateString()}
                </div>
                <p className="text-muted">Date</p>
              </div>
            </div>

            {/* Doughnut Chart */}
            <div className="row mt-4">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h6>Performance Breakdown</h6>
                  </div>
                  <div className="card-body">
                    <Doughnut data={doughnutData} />
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">Details</h6>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowDetails(!showDetails)}
                    >
                      {showDetails ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                  <div className="card-body">
                    <ul className="list-group">
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Accuracy</span>
                        <span className="fw-bold">
                          {((results.correctAnswers / results.totalQuestions) * 100).toFixed(1)}%
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Speed</span>
                        <span className="fw-bold">
                          {(results.timeSpent / results.totalQuestions).toFixed(1)}s per question
                        </span>
                      </li>
                      <li className="list-group-item d-flex justify-content-between">
                        <span>Rank</span>
                        <span className="badge bg-info">
                          {results.score >= 90 ? 'Excellent' : 
                           results.score >= 70 ? 'Good' : 
                           results.score >= 50 ? 'Average' : 'Needs Improvement'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis (Optional) */}
            {showDetails && (
              <div className="card mt-4">
                <div className="card-header">
                  <h6>Question-wise Analysis</h6>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Question Type</th>
                          <th>Your Answer</th>
                          <th>Correct Answer</th>
                          <th>Status</th>
                          <th>Points</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* This would require storing question details in results */}
                        <tr>
                          <td colSpan="6" className="text-center text-muted">
                            Detailed question analysis would require enhanced data storage
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overall Statistics */}
      <div className="card">
        <div className="card-header">
          <h4>Overall Performance Statistics</h4>
        </div>
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-white bg-success mb-3">
                <div className="card-body">
                  <h5 className="card-title">Average Score</h5>
                  <h2 className="card-text">{performance.average}%</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-primary mb-3">
                <div className="card-body">
                  <h5 className="card-title">Highest Score</h5>
                  <h2 className="card-text">{performance.highest}%</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-warning mb-3">
                <div className="card-body">
                  <h5 className="card-title">Lowest Score</h5>
                  <h2 className="card-text">{performance.lowest}%</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-white bg-info mb-3">
                <div className="card-body">
                  <h5 className="card-title">Total Attempts</h5>
                  <h2 className="card-text">{performance.totalAttempts}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Score Distribution Chart */}
          <div className="row">
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h6>Score Distribution</h6>
                </div>
                <div className="card-body">
                  <Bar 
                    data={chartData}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false
                        },
                        title: {
                          display: true,
                          text: 'Score Ranges Distribution'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h6>Recent Attempts</h6>
                </div>
                <div className="card-body">
                  {allResults.length === 0 ? (
                    <p className="text-muted">No attempts recorded</p>
                  ) : (
                    <div className="list-group">
                      {allResults.slice(-5).reverse().map((result, index) => (
                        <div key={result.id} className="list-group-item">
                          <div className="d-flex justify-content-between">
                            <div>
                              <small className="text-muted">{result.quizName}</small>
                              <br />
                              <small>{new Date(result.timestamp).toLocaleDateString()}</small>
                            </div>
                            <span className={`badge ${result.score >= 70 ? 'bg-success' : result.score >= 50 ? 'bg-warning' : 'bg-danger'}`}>
                              {result.score}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 text-center">
            <button className="btn btn-primary me-2" onClick={onBack}>
              Take Another Quiz
            </button>
            <button 
              className="btn btn-outline-danger"
              onClick={() => {
                if (window.confirm('Clear all quiz data and results?')) {
                  storage.clearAllData();
                  setAllResults([]);
                }
              }}
            >
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;