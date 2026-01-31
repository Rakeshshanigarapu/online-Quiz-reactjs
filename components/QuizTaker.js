// src/components/QuizTaker.js
import React, { useState, useEffect } from 'react';
import { storage } from '../utils/storage';

const QuizTaker = ({ quiz, onComplete, onBack }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(quiz.timeLimit * 60); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wordCounts, setWordCounts] = useState({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleDescriptiveWordCount = (questionId, text) => {
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    setWordCounts(prev => ({
      ...prev,
      [questionId]: words
    }));
    handleAnswerChange(questionId, text);
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxScore = 0;

    quiz.questions.forEach(q => {
      maxScore += q.points || 1;
      
      const userAnswer = answers[q.id];
      if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
        
        switch (q.type) {
          case 'MCQ':
          case 'IMAGE_BASED':
            if (userAnswer === q.correctAnswer) {
              totalScore += q.points || 1;
            }
            break;
            
          case 'MULTI_SELECT':
            if (Array.isArray(userAnswer) && Array.isArray(q.correctAnswer)) {
              // Calculate partial score for multi-select
              const correctCount = q.correctAnswer.filter(ans => userAnswer.includes(ans)).length;
              const incorrectCount = userAnswer.filter(ans => !q.correctAnswer.includes(ans)).length;
              const totalCorrect = q.correctAnswer.length;
              
              if (incorrectCount === 0 && correctCount === totalCorrect) {
                totalScore += q.points || 1; // Full points if all correct and no incorrect
              } else if (correctCount > 0) {
                // Partial points based on correct selections
                totalScore += (correctCount / totalCorrect) * (q.points || 1);
              }
            }
            break;
            
          case 'TRUE_FALSE':
            if (userAnswer === q.correctAnswer) {
              totalScore += q.points || 1;
            }
            break;
            
          case 'DESCRIPTIVE':
            // For descriptive, give partial points based on keywords
            if (typeof userAnswer === 'string' && q.keywords && q.keywords.length > 0) {
              const answerWords = userAnswer.toLowerCase().split(/\W+/);
              const matchedKeywords = q.keywords.filter(keyword => 
                answerWords.includes(keyword.toLowerCase())
              ).length;
              const keywordRatio = matchedKeywords / q.keywords.length;
              totalScore += keywordRatio * (q.points || 10);
            } else if (q.keywords && q.keywords.length === 0) {
              // If no keywords specified, give full points for non-empty answer
              if (userAnswer.trim().length > 0) {
                totalScore += q.points || 10;
              }
            }
            break;
            
          case 'FILL_BLANK':
            if (Array.isArray(userAnswer) && Array.isArray(q.blanks)) {
              let correctBlanks = 0;
              userAnswer.forEach((answer, index) => {
                if (q.blanks[index] && 
                    answer.trim().toLowerCase() === q.blanks[index].correctAnswer.trim().toLowerCase()) {
                  correctBlanks++;
                }
              });
              const blankRatio = q.blanks.length > 0 ? correctBlanks / q.blanks.length : 0;
              totalScore += blankRatio * (q.points || 1);
            }
            break;
            
          case 'MATCHING':
            if (Array.isArray(userAnswer) && Array.isArray(q.correctMatches)) {
              let correctMatches = 0;
              userAnswer.forEach((match, index) => {
                if (q.correctMatches[index] && 
                    match.right === q.correctMatches[index].right) {
                  correctMatches++;
                }
              });
              const matchRatio = q.correctMatches.length > 0 ? correctMatches / q.correctMatches.length : 0;
              totalScore += matchRatio * (q.points || 1);
            }
            break;
            
          case 'RANKING':
            if (Array.isArray(userAnswer) && Array.isArray(q.correctOrder)) {
              let correctPositions = 0;
              userAnswer.forEach((itemId, index) => {
                if (itemId === q.correctOrder[index]) {
                  correctPositions++;
                }
              });
              const orderRatio = q.correctOrder.length > 0 ? correctPositions / q.correctOrder.length : 0;
              totalScore += orderRatio * (q.points || 1);
            }
            break;
            
          case 'RC':
            if (typeof userAnswer === 'object' && q.questions) {
              let subQuestionScore = 0;
              let subQuestionMax = 0;
              
              q.questions.forEach((subQ, index) => {
                subQuestionMax += subQ.points || 1;
                
                const subAnswer = userAnswer[index];
                if (subAnswer !== undefined && subAnswer !== null) {
                  if (subQ.type === 'MCQ') {
                    if (subAnswer === subQ.correctAnswer) {
                      subQuestionScore += subQ.points || 1;
                    }
                  } else if (subQ.type === 'TF') {
                    if (subAnswer === subQ.correctAnswer) {
                      subQuestionScore += subQ.points || 1;
                    }
                  } else if (subQ.type === 'SHORT') {
                    // For short answer, check if answer is provided
                    if (subAnswer.trim().length > 0) {
                      subQuestionScore += subQ.points || 1;
                    }
                  }
                }
              });
              
              if (subQuestionMax > 0) {
                totalScore += (subQuestionScore / subQuestionMax) * (q.points || 10);
              }
            }
            break;
            
          case 'DI':
            if (typeof userAnswer === 'object' && q.questions) {
              let subQuestionScore = 0;
              let subQuestionMax = 0;
              
              q.questions.forEach((subQ, index) => {
                subQuestionMax += subQ.points || 1;
                
                const subAnswer = userAnswer[index];
                if (subAnswer !== undefined && subAnswer !== null && typeof subAnswer === 'string') {
                  // Simple exact match for DI answers
                  if (subAnswer.trim().toLowerCase() === subQ.answer.trim().toLowerCase()) {
                    subQuestionScore += subQ.points || 1;
                  }
                }
              });
              
              if (subQuestionMax > 0) {
                totalScore += (subQuestionScore / subQuestionMax) * (q.points || 10);
              }
            }
            break;
        }
      }
    });

    return {
      score: maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0,
      correct: totalScore,
      total: maxScore
    };
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    const result = calculateScore();
    
    const quizResult = {
      quizId: quiz.id,
      quizName: quiz.title,
      answers: answers,
      score: result.score,
      correctAnswers: result.correct,
      totalQuestions: quiz.questions.length,
      timeSpent: (quiz.timeLimit * 60) - timeLeft,
      timestamp: new Date().toISOString()
    };

    storage.saveResult(quizResult);
    
    // Show results for 2 seconds then complete
    setTimeout(() => {
      onComplete(quizResult);
    }, 2000);
  };

  // Helper function to get option text
  const getOptionText = (option) => {
    if (typeof option === 'object' && option !== null) {
      return option.text || option.toString();
    }
    return option;
  };

  // Helper function to check if option is correct (for display purposes)
  const isOptionCorrect = (option, question) => {
    if (typeof option === 'object' && option !== null) {
      return option.isCorrect || false;
    }
    return false;
  };

  const renderQuestion = (question, index) => {
    const questionNumber = index + 1;
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'MCQ':
      case 'IMAGE_BASED':
      case 'MULTI_SELECT':
        return (
          <div className="question mcq">
            <h5>{questionNumber}. {question.text || question.question}</h5>
            {question.type === 'IMAGE_BASED' && question.imageUrl && (
              <div className="text-center my-3">
                <img 
                  src={question.imageUrl} 
                  alt="Question" 
                  className="img-fluid rounded"
                  style={{ maxHeight: '300px' }}
                />
              </div>
            )}
            <div className="options mt-3">
              {(question.options || []).map((option, optIndex) => {
                const optionText = getOptionText(option);
                const isSelected = question.type === 'MULTI_SELECT' 
                  ? Array.isArray(userAnswer) && userAnswer.includes(optIndex)
                  : userAnswer === optIndex;

                return (
                  <div key={optIndex} className="form-check mb-2">
                    <input
                      type={question.type === 'MULTI_SELECT' ? 'checkbox' : 'radio'}
                      id={`q${question.id}_opt${optIndex}`}
                      name={`question_${question.id}`}
                      className="form-check-input"
                      checked={isSelected}
                      onChange={() => {
                        if (question.type === 'MULTI_SELECT') {
                          const currentAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                          const newAnswers = currentAnswers.includes(optIndex)
                            ? currentAnswers.filter(ans => ans !== optIndex)
                            : [...currentAnswers, optIndex];
                          handleAnswerChange(question.id, newAnswers);
                        } else {
                          handleAnswerChange(question.id, optIndex);
                        }
                      }}
                    />
                    <label className="form-check-label w-100" htmlFor={`q${question.id}_opt${optIndex}`}>
                      {optionText}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'TRUE_FALSE':
        return (
          <div className="question tf">
            <h5>{questionNumber}. {question.text || question.question}</h5>
            <div className="btn-group mt-3" role="group">
              <button
                type="button"
                className={`btn ${userAnswer === true ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleAnswerChange(question.id, true)}
              >
                True
              </button>
              <button
                type="button"
                className={`btn ${userAnswer === false ? 'btn-danger' : 'btn-outline-danger'}`}
                onClick={() => handleAnswerChange(question.id, false)}
              >
                False
              </button>
            </div>
          </div>
        );

      case 'DESCRIPTIVE':
        return (
          <div className="question descriptive">
            <h5>{questionNumber}. {question.text || question.question}</h5>
            <div className="mt-3">
              <textarea
                className="form-control"
                rows="6"
                value={userAnswer || ''}
                onChange={(e) => handleDescriptiveWordCount(question.id, e.target.value)}
                placeholder="Type your answer here..."
              />
              <div className="form-text d-flex justify-content-between">
                <span>
                  Minimum {question.minWords || 50} words, Maximum {question.maxWords || 500} words
                </span>
                <span className={wordCounts[question.id] < (question.minWords || 50) ? 'text-danger' : 'text-success'}>
                  Words: {wordCounts[question.id] || 0}
                </span>
              </div>
            </div>
          </div>
        );

      case 'FILL_BLANK':
        return (
          <div className="question fill-blank">
            <h5>{questionNumber}. Complete the following:</h5>
            <div className="mt-3">
              <p>{question.text || question.question}</p>
              <div className="blanks">
                {(question.blanks || []).map((blank, blankIndex) => {
                  const blankAnswer = Array.isArray(userAnswer) ? userAnswer[blankIndex] || '' : '';
                  return (
                    <div key={blankIndex} className="mb-3">
                      <label className="form-label">Blank {blankIndex + 1}</label>
                      <input
                        type="text"
                        className="form-control"
                        value={blankAnswer}
                        onChange={(e) => {
                          const newAnswers = Array.isArray(userAnswer) ? [...userAnswer] : [];
                          newAnswers[blankIndex] = e.target.value;
                          handleAnswerChange(question.id, newAnswers);
                        }}
                        placeholder={`Enter answer for blank ${blankIndex + 1}`}
                      />
                      {blank.hint && (
                        <div className="form-text">Hint: {blank.hint}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'MATCHING':
        return (
          <div className="question matching">
            <h5>{questionNumber}. {question.instruction || 'Match the following:'}</h5>
            <div className="mt-3">
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th width="45%">Column A</th>
                      <th width="45%">Column B</th>
                      <th width="10%">Match</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(question.items || []).map((item, index) => {
                      const currentMatches = Array.isArray(userAnswer) ? userAnswer : [];
                      const currentMatch = currentMatches[index] || {};
                      
                      // Get available options from correctMatches (excluding already matched ones)
                      const availableOptions = (question.correctMatches || [])
                        .filter(match => {
                          // Check if this right option is already used
                          const isUsed = currentMatches.some((m, i) => 
                            i !== index && m.right === match.right
                          );
                          return !isUsed;
                        })
                        .map(match => match.right);

                      return (
                        <tr key={index}>
                          <td>{item.left}</td>
                          <td>
                            <select
                              className="form-control"
                              value={currentMatch.right || ''}
                              onChange={(e) => {
                                const newMatches = [...currentMatches];
                                newMatches[index] = { left: item.left, right: e.target.value };
                                handleAnswerChange(question.id, newMatches);
                              }}
                            >
                              <option value="">Select match</option>
                              {availableOptions.map((option, optIndex) => (
                                <option key={optIndex} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="text-center">
                            {currentMatch.right && (
                              <span className="badge bg-success">Matched</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'RANKING':
        return (
          <div className="question ranking">
            <h5>{questionNumber}. {question.instruction || 'Arrange in correct order:'}</h5>
            <div className="mt-3">
              <div className="list-group">
                {(question.items || []).map((item, index) => {
                  const currentOrder = Array.isArray(userAnswer) ? userAnswer : [];
                  const currentIndex = currentOrder.indexOf(item.id);
                  
                  return (
                    <div key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                      <span>{item.text}</span>
                      <div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => {
                            const newOrder = [...currentOrder];
                            const currentPos = newOrder.indexOf(item.id);
                            if (currentPos > 0) {
                              [newOrder[currentPos], newOrder[currentPos - 1]] = 
                              [newOrder[currentPos - 1], newOrder[currentPos]];
                              handleAnswerChange(question.id, newOrder);
                            }
                          }}
                        >
                          <i className="bi bi-arrow-up"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            const newOrder = [...currentOrder];
                            const currentPos = newOrder.indexOf(item.id);
                            if (currentPos < newOrder.length - 1) {
                              [newOrder[currentPos], newOrder[currentPos + 1]] = 
                              [newOrder[currentPos + 1], newOrder[currentPos]];
                              handleAnswerChange(question.id, newOrder);
                            }
                          }}
                        >
                          <i className="bi bi-arrow-down"></i>
                        </button>
                        <span className="ms-3 badge bg-secondary">
                          Position: {currentIndex !== -1 ? currentIndex + 1 : 'Not set'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    // Initialize order if not set
                    if (!Array.isArray(userAnswer) || userAnswer.length === 0) {
                      const initialOrder = (question.items || []).map(item => item.id);
                      handleAnswerChange(question.id, initialOrder);
                    }
                  }}
                >
                  Initialize Order
                </button>
              </div>
            </div>
          </div>
        );

      case 'RC':
        return (
          <div className="question rc">
            <div className="card">
              <div className="card-header">
                <h5>Reading Comprehension: {question.title || 'Passage'}</h5>
              </div>
              <div className="card-body">
                <div className="passage mb-4">
                  <div className="border p-3 bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                    {question.passage}
                  </div>
                </div>
                
                <h6>Questions:</h6>
                {(question.questions || []).map((subQ, subIndex) => {
                  const subAnswer = userAnswer && userAnswer[subIndex];
                  
                  return (
                    <div key={subIndex} className="sub-question mb-4">
                      <p><strong>Q{questionNumber}.{subIndex + 1}</strong> {subQ.text}</p>
                      
                      {subQ.type === 'MCQ' ? (
                        <div className="options">
                          {(subQ.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="form-check">
                              <input
                                type="radio"
                                id={`rc_${question.id}_${subIndex}_${optIndex}`}
                                name={`rc_${question.id}_${subIndex}`}
                                className="form-check-input"
                                checked={subAnswer === optIndex}
                                onChange={() => {
                                  const newAnswers = userAnswer || {};
                                  newAnswers[subIndex] = optIndex;
                                  handleAnswerChange(question.id, newAnswers);
                                }}
                              />
                              <label className="form-check-label" htmlFor={`rc_${question.id}_${subIndex}_${optIndex}`}>
                                {option}
                              </label>
                            </div>
                          ))}
                        </div>
                      ) : subQ.type === 'TF' ? (
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className={`btn ${subAnswer === true ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => {
                              const newAnswers = userAnswer || {};
                              newAnswers[subIndex] = true;
                              handleAnswerChange(question.id, newAnswers);
                            }}
                          >
                            True
                          </button>
                          <button
                            type="button"
                            className={`btn ${subAnswer === false ? 'btn-danger' : 'btn-outline-danger'}`}
                            onClick={() => {
                              const newAnswers = userAnswer || {};
                              newAnswers[subIndex] = false;
                              handleAnswerChange(question.id, newAnswers);
                            }}
                          >
                            False
                          </button>
                        </div>
                      ) : (
                        <textarea
                          className="form-control"
                          rows="2"
                          value={subAnswer || ''}
                          onChange={(e) => {
                            const newAnswers = userAnswer || {};
                            newAnswers[subIndex] = e.target.value;
                            handleAnswerChange(question.id, newAnswers);
                          }}
                          placeholder="Your answer..."
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'DI':
        return (
          <div className="question di">
            <div className="card">
              <div className="card-header">
                <h5>Data Interpretation: {question.title || 'Data Set'}</h5>
              </div>
              <div className="card-body">
                <div className="data mb-4">
                  <pre className="border p-3 bg-light" style={{ whiteSpace: 'pre-wrap' }}>
                    {question.data}
                  </pre>
                </div>
                
                <h6>Questions:</h6>
                {(question.questions || []).map((subQ, subIndex) => {
                  const subAnswer = userAnswer && userAnswer[subIndex];
                  
                  return (
                    <div key={subIndex} className="sub-question mb-3">
                      <p><strong>Q{questionNumber}.{subIndex + 1}</strong> {subQ.text}</p>
                      <input
                        type="text"
                        className="form-control"
                        value={subAnswer || ''}
                        onChange={(e) => {
                          const newAnswers = userAnswer || {};
                          newAnswers[subIndex] = e.target.value;
                          handleAnswerChange(question.id, newAnswers);
                        }}
                        placeholder="Your answer..."
                      />
                      {subQ.answerType && (
                        <div className="form-text">
                          Answer type: {subQ.answerType}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="question unknown">
            <h5>{questionNumber}. Unknown question type: {question.type}</h5>
            <p>Question text: {question.text || question.question || 'No text provided'}</p>
          </div>
        );
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  if (isSubmitting) {
    const result = calculateScore();
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h4>Calculating your score...</h4>
        <div className="mt-4">
          <div className="progress" style={{ height: '30px' }}>
            <div 
              className="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              style={{ width: `${result.score}%` }}
            >
              {result.score}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if quiz has questions
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="text-center py-5">
        <h4>No questions available in this quiz</h4>
        <button className="btn btn-primary mt-3" onClick={onBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="quiz-taker">
      {/* Quiz Header */}
      <div className="card mb-4">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-0">{quiz.title}</h4>
            <small className="text-muted">{quiz.description}</small>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center gap-3">
              <div className={`badge ${quiz.difficulty === 'Easy' ? 'bg-success' : quiz.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'}`}>
                {quiz.difficulty}
              </div>
              <div className="badge bg-info">
                {quiz.questions.length} Questions
              </div>
              <div className="badge bg-danger">
                <i className="bi bi-clock me-1"></i> {formatTime(timeLeft)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Question Navigation */}
        <div className="col-md-3">
          <div className="card sticky-top" style={{ top: '20px' }}>
            <div className="card-header">
              <h6>Questions</h6>
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {quiz.questions.map((q, index) => (
                  <button
                    key={q.id}
                    className={`btn btn-sm ${currentQuestion === index ? 'btn-primary' : answers[q.id] !== undefined ? 'btn-success' : 'btn-outline-secondary'}`}
                    onClick={() => setCurrentQuestion(index)}
                    style={{ width: '40px', height: '40px' }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="progress mt-3">
                <div 
                  className="progress-bar" 
                  role="progressbar" 
                  style={{ width: `${progress}%` }}
                >
                  {Math.round(progress)}%
                </div>
              </div>
              
              <div className="mt-3">
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={handleSubmit}
                  >
                    Submit Quiz
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={onBack}
                  >
                    Exit Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Display */}
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              {renderQuestion(quiz.questions[currentQuestion], currentQuestion)}
              
              <div className="d-flex justify-content-between mt-4">
                <button 
                  className="btn btn-outline-primary"
                  onClick={handlePrev}
                  disabled={currentQuestion === 0}
                >
                  <i className="bi bi-arrow-left"></i> Previous
                </button>
                
                <div>
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </div>
                
                <button 
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={currentQuestion === quiz.questions.length - 1}
                >
                  Next <i className="bi bi-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
          
          {/* Question Instructions */}
          <div className="card mt-3">
            <div className="card-body">
              <h6>Instructions:</h6>
              <ul className="mb-0">
                <li>Answer all questions before submitting</li>
                <li>You can navigate between questions using the number buttons</li>
                <li>The quiz will auto-submit when time expires</li>
                <li>For Multiple Select questions, select all correct answers</li>
                <li>For Descriptive answers, ensure you meet the word count requirement</li>
                <li>For Matching questions, each option can only be used once</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizTaker;