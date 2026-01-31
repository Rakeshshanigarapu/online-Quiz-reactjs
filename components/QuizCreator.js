// src/components/QuizCreator.js
import React, { useState, useEffect } from 'react';
import { storage, QUESTION_TYPES } from '../utils/storage';
import QuestionCreator from './QuestionTypes';

const QuizCreator = ({ onBack }) => {
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    category: 'General',
    difficulty: 'Medium',
    timeLimit: 30,
    passingScore: 60,
    questions: []
  });

  const [currentStep, setCurrentStep] = useState(1); // 1: Quiz info, 2: Add questions
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [selectedType, setSelectedType] = useState('MCQ');
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const handleQuizInfoChange = (e) => {
    const { name, value } = e.target;
    setQuiz(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveQuestion = (newQuestion) => {
    if (editingQuestion !== null) {
      // Update existing question
      const updatedQuestions = [...quiz.questions];
      updatedQuestions[editingQuestion] = {
        ...newQuestion,
        id: quiz.questions[editingQuestion].id || Date.now()
      };
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    } else {
      // Add new question
      setQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, { ...newQuestion, id: Date.now() }]
      }));
    }
    
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setSelectedType('MCQ');
  };

  const handleCancelQuestion = () => {
    setShowQuestionForm(false);
    setEditingQuestion(null);
    setSelectedType('MCQ');
  };

  const editQuestion = (index) => {
    const question = quiz.questions[index];
    setEditingQuestion(index);
    setSelectedType(question.type);
    setShowQuestionForm(true);
  };

  const deleteQuestion = (index) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
      setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const moveQuestion = (fromIndex, toIndex) => {
    const updatedQuestions = [...quiz.questions];
    const [movedQuestion] = updatedQuestions.splice(fromIndex, 1);
    updatedQuestions.splice(toIndex, 0, movedQuestion);
    setQuiz(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const calculateTotalPoints = () => {
    return quiz.questions.reduce((total, q) => total + (q.points || 1), 0);
  };

  const handleSaveQuiz = () => {
    if (!quiz.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (quiz.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    const finalQuiz = {
      ...quiz,
      totalPoints: calculateTotalPoints(),
      questionCount: quiz.questions.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    storage.saveQuiz(finalQuiz);
    alert(`Quiz "${finalQuiz.title}" saved successfully!`);
    onBack();
  };

  const renderQuestionPreview = (question, index) => {
    return (
      <div className="list-group-item">
        <div className="d-flex justify-content-between align-items-start">
          <div className="flex-grow-1">
            <div className="d-flex align-items-center mb-2">
              <span className="badge bg-secondary me-2">#{index + 1}</span>
              <span className="badge bg-info me-2">
                {QUESTION_TYPES[question.type]?.name || question.type}
              </span>
              <span className="badge bg-warning me-2">{question.points || 1} pts</span>
              {question.difficulty && (
                <span className={`badge ${
                  question.difficulty === 'Easy' ? 'bg-success' : 
                  question.difficulty === 'Medium' ? 'bg-warning' : 'bg-danger'
                }`}>
                  {question.difficulty}
                </span>
              )}
            </div>
            <p className="mb-1"><strong>{question.text || question.question || 'Untitled Question'}</strong></p>
            {question.type === 'MCQ' || question.type === 'MULTI_SELECT' || question.type === 'IMAGE_BASED' ? (
              <div className="mt-2">
                <small className="text-muted">Options:</small>
                <ul className="mb-0 ps-3">
                  {question.options?.slice(0, 3).map((opt, optIndex) => (
                    <li key={optIndex} className="small">
                      {typeof opt === 'object' ? opt.text : opt}
                      {opt.isCorrect && <span className="badge bg-success ms-2">Correct</span>}
                    </li>
                  ))}
                  {question.options?.length > 3 && (
                    <li className="small text-muted">...and {question.options.length - 3} more</li>
                  )}
                </ul>
              </div>
            ) : question.type === 'DESCRIPTIVE' ? (
              <div className="mt-2">
                <small className="text-muted">
                  {question.minWords || 50} - {question.maxWords || 500} words
                </small>
              </div>
            ) : question.type === 'RC' ? (
              <div className="mt-2">
                <small className="text-muted">
                  Passage: {question.title || 'Untitled'} ({question.questions?.length || 0} questions)
                </small>
              </div>
            ) : question.type === 'DI' ? (
              <div className="mt-2">
                <small className="text-muted">
                  Data: {question.title || 'Untitled'} ({question.questions?.length || 0} questions)
                </small>
              </div>
            ) : null}
          </div>
          <div className="btn-group btn-group-sm">
            <button 
              className="btn btn-outline-primary"
              onClick={() => editQuestion(index)}
            >
              <i className="bi bi-pencil"></i>
            </button>
            <button 
              className="btn btn-outline-danger"
              onClick={() => deleteQuestion(index)}
            >
              <i className="bi bi-trash"></i>
            </button>
            {index > 0 && (
              <button 
                className="btn btn-outline-secondary"
                onClick={() => moveQuestion(index, index - 1)}
              >
                <i className="bi bi-arrow-up"></i>
              </button>
            )}
            {index < quiz.questions.length - 1 && (
              <button 
                className="btn btn-outline-secondary"
                onClick={() => moveQuestion(index, index + 1)}
              >
                <i className="bi bi-arrow-down"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="quiz-creator">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{showQuestionForm ? 'Add Question' : 'Create New Quiz'}</h1>
        <button className="btn btn-outline-secondary" onClick={onBack}>
          <i className="bi bi-arrow-left me-2"></i>Back to Dashboard
        </button>
      </div>

      {!showQuestionForm && currentStep === 1 && (
        <div className="card">
          <div className="card-header">
            <h4>Quiz Information</h4>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label">Quiz Title *</label>
                <input
                  type="text"
                  className="form-control"
                  name="title"
                  value={quiz.title}
                  onChange={handleQuizInfoChange}
                  placeholder="Enter quiz title"
                  required
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  name="category"
                  value={quiz.category}
                  onChange={handleQuizInfoChange}
                >
                  <option value="General">General Knowledge</option>
                  <option value="Math">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="History">History</option>
                  <option value="English">English</option>
                  <option value="Aptitude">Aptitude</option>
                  <option value="Reasoning">Logical Reasoning</option>
                  <option value="Computer">Computer Science</option>
                  <option value="Business">Business</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  name="description"
                  value={quiz.description}
                  onChange={handleQuizInfoChange}
                  rows="3"
                  placeholder="Describe your quiz..."
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-select"
                  name="difficulty"
                  value={quiz.difficulty}
                  onChange={handleQuizInfoChange}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Time Limit (minutes)</label>
                <input
                  type="number"
                  className="form-control"
                  name="timeLimit"
                  value={quiz.timeLimit}
                  onChange={handleQuizInfoChange}
                  min="1"
                  max="180"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Passing Score (%)</label>
                <input
                  type="number"
                  className="form-control"
                  name="passingScore"
                  value={quiz.passingScore}
                  onChange={handleQuizInfoChange}
                  min="0"
                  max="100"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Questions Added</label>
                <div className="form-control bg-light">
                  {quiz.questions.length} questions
                </div>
              </div>
            </div>

            <div className="mt-4 d-flex justify-content-between">
              <div>
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                  disabled={!quiz.title.trim()}
                >
                  Next: Add Questions <i className="bi bi-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showQuestionForm && currentStep === 2 && (
        <div className="row">
          {/* Question Type Selector */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">
                <h5>Add New Question</h5>
              </div>
              <div className="card-body">
                <div className="list-group">
                  {Object.values(QUESTION_TYPES).map(type => (
                    <button
                      key={type.id}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setSelectedType(type.id);
                        setShowQuestionForm(true);
                        setEditingQuestion(null);
                      }}
                    >
                      <i className={`bi ${type.icon} me-2`}></i>
                      <div>
                        <strong>{type.name}</strong>
                        <small className="d-block text-muted">{type.description}</small>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quiz Summary */}
            <div className="card">
              <div className="card-header">
                <h5>Quiz Summary</h5>
              </div>
              <div className="card-body">
                <h6>{quiz.title || 'Untitled Quiz'}</h6>
                <p className="text-muted small">{quiz.description}</p>
                <hr />
                <div className="mb-2">
                  <strong>Questions:</strong> {quiz.questions.length}
                </div>
                <div className="mb-2">
                  <strong>Total Points:</strong> {calculateTotalPoints()}
                </div>
                <div className="mb-2">
                  <strong>Category:</strong> {quiz.category}
                </div>
                <div className="mb-2">
                  <strong>Difficulty:</strong> {quiz.difficulty}
                </div>
                <div className="mb-2">
                  <strong>Time Limit:</strong> {quiz.timeLimit} minutes
                </div>
                <div className="mb-3">
                  <strong>Passing Score:</strong> {quiz.passingScore}%
                </div>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success"
                    onClick={handleSaveQuiz}
                    disabled={quiz.questions.length === 0}
                  >
                    <i className="bi bi-save me-2"></i>Save Quiz
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => setCurrentStep(1)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>Back to Quiz Info
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="col-md-8">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>Questions ({quiz.questions.length})</h5>
                <button 
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => {
                    setSelectedType('MCQ');
                    setShowQuestionForm(true);
                  }}
                >
                  <i className="bi bi-plus me-1"></i>Add Question
                </button>
              </div>
              <div className="card-body">
                {quiz.questions.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-journal-text display-1 text-muted"></i>
                    <p className="mt-3">No questions added yet.</p>
                    <p className="text-muted">Click "Add Question" or select a question type from the left panel to get started.</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {quiz.questions.map((question, index) => renderQuestionPreview(question, index))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showQuestionForm && (
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">
                {editingQuestion !== null ? 'Edit Question' : 'Add New Question'}
                <span className="badge bg-primary ms-2">
                  {QUESTION_TYPES[selectedType]?.name || selectedType}
                </span>
              </h4>
            </div>
            <button 
              className="btn btn-sm btn-outline-secondary"
              onClick={handleCancelQuestion}
            >
              <i className="bi bi-x-lg"></i> Cancel
            </button>
          </div>
          <div className="card-body">
            <QuestionCreator
              type={selectedType}
              initialData={editingQuestion !== null ? quiz.questions[editingQuestion] : null}
              onSave={handleSaveQuestion}
              onCancel={handleCancelQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizCreator;