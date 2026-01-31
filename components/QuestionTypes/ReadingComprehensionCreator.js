// src/components/QuestionTypes/ReadingComprehensionCreator.js
import React, { useState, useEffect } from 'react';

const ReadingComprehensionCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'RC',
    title: '',
    passage: '',
    questions: [
      { id: 1, text: '', type: 'MCQ', options: ['', '', ''], correctAnswer: 0, points: 1 }
    ],
    totalPoints: 0,
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) {
      const totalPts = initialData.questions.reduce((sum, q) => sum + (q.points || 1), 0);
      setQuestion({ ...initialData, totalPoints: totalPts });
    }
  }, [initialData]);

  const addQuestion = () => {
    const newId = Math.max(...question.questions.map(q => q.id)) + 1;
    setQuestion({
      ...question,
      questions: [
        ...question.questions,
        { id: newId, text: '', type: 'MCQ', options: ['', '', ''], correctAnswer: 0, points: 1 }
      ]
    });
  };

  const removeQuestion = (id) => {
    if (question.questions.length <= 1) {
      alert('At least one question is required');
      return;
    }
    const updatedQuestions = question.questions.filter(q => q.id !== id);
    setQuestion({
      ...question,
      questions: updatedQuestions
    });
  };

  const updateQuestion = (id, field, value) => {
    const updatedQuestions = question.questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    );
    
    // Calculate total points
    const totalPts = updatedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    
    setQuestion({
      ...question,
      questions: updatedQuestions,
      totalPoints: totalPts
    });
  };

  const updateQuestionOption = (questionId, optionIndex, value) => {
    const updatedQuestions = question.questions.map(q => {
      if (q.id === questionId) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    });
    setQuestion({ ...question, questions: updatedQuestions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.title.trim()) {
      alert('Please enter a title for the passage');
      return;
    }

    if (!question.passage.trim()) {
      alert('Please enter the reading passage');
      return;
    }

    // Validate all questions
    for (let q of question.questions) {
      if (!q.text.trim()) {
        alert('Please fill all question texts');
        return;
      }
      if (q.type === 'MCQ') {
        const emptyOptions = q.options.filter(opt => !opt.trim());
        if (emptyOptions.length > 0) {
          alert('Please fill all options for MCQ questions');
          return;
        }
      }
    }

    onSave(question);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Passage Title *</label>
        <input
          type="text"
          className="form-control"
          value={question.title}
          onChange={(e) => setQuestion({...question, title: e.target.value})}
          placeholder="e.g., The Future of Artificial Intelligence"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Reading Passage *</label>
        <textarea
          className="form-control"
          value={question.passage}
          onChange={(e) => setQuestion({...question, passage: e.target.value})}
          rows="8"
          placeholder="Enter the reading passage here..."
          required
        />
        <div className="form-text">
          Word count: {question.passage.split(/\s+/).filter(Boolean).length} words
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Comprehension Questions</label>
        {question.questions.map((q, index) => (
          <div key={q.id} className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Question {index + 1}</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => removeQuestion(q.id)}
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="row mb-2">
                <div className="col-md-8">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    className="form-control"
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    rows="2"
                    placeholder="Enter question text..."
                    required
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Question Type</label>
                  <select
                    className="form-select"
                    value={q.type}
                    onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="TF">True/False</option>
                    <option value="SHORT">Short Answer</option>
                  </select>
                </div>
              </div>

              {q.type === 'MCQ' && (
                <div className="mb-3">
                  <label className="form-label">Options *</label>
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="input-group mb-2">
                      <div className="input-group-text">
                        <input
                          type="radio"
                          name={`correctAnswer_${q.id}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => updateQuestion(q.id, 'correctAnswer', optIndex)}
                          className="form-check-input mt-0"
                        />
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        value={option}
                        onChange={(e) => updateQuestionOption(q.id, optIndex, e.target.value)}
                        placeholder={`Option ${optIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Points *</label>
                  <input
                    type="number"
                    className="form-control"
                    value={q.points}
                    onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addQuestion}>
          <i className="bi bi-plus"></i> Add Another Question
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Total Points</label>
          <div className="form-control bg-light">
            {question.totalPoints} points across {question.questions.length} questions
          </div>
        </div>
        <div className="col-md-6">
          <label className="form-label">Difficulty</label>
          <select
            className="form-select"
            value={question.difficulty}
            onChange={(e) => setQuestion({...question, difficulty: e.target.value})}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
      </div>

      <div className="d-flex justify-content-between">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary ms-auto">
          {initialData ? 'Update Passage' : 'Add Reading Comprehension'}
        </button>
      </div>
    </form>
  );
};

export default ReadingComprehensionCreator;