// src/components/QuestionTypes/TrueFalseCreator.js
import React, { useState, useEffect } from 'react';

const TrueFalseCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'TRUE_FALSE',
    text: '',
    correctAnswer: true,
    points: 1,
    explanation: '',
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) setQuestion(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.text.trim()) {
      alert('Please enter question text');
      return;
    }
    onSave(question);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Statement *</label>
        <textarea
          className="form-control"
          value={question.text}
          onChange={(e) => setQuestion({...question, text: e.target.value})}
          rows="3"
          placeholder="Enter the statement (e.g., 'The Earth is flat.')"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Correct Answer *</label>
        <div className="btn-group w-100" role="group">
          <button
            type="button"
            className={`btn ${question.correctAnswer === true ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setQuestion({...question, correctAnswer: true})}
          >
            <i className="bi bi-check-circle me-2"></i>True
          </button>
          <button
            type="button"
            className={`btn ${question.correctAnswer === false ? 'btn-danger' : 'btn-outline-danger'}`}
            onClick={() => setQuestion({...question, correctAnswer: false})}
          >
            <i className="bi bi-x-circle me-2"></i>False
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Points *</label>
          <input
            type="number"
            className="form-control"
            value={question.points}
            onChange={(e) => setQuestion({...question, points: parseInt(e.target.value) || 1})}
            min="1"
            required
          />
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

      <div className="mb-3">
        <label className="form-label">Explanation (Optional)</label>
        <textarea
          className="form-control"
          value={question.explanation}
          onChange={(e) => setQuestion({...question, explanation: e.target.value})}
          rows="2"
          placeholder="Explain why this answer is correct..."
        />
      </div>

      <div className="d-flex justify-content-between">
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary ms-auto">
          {initialData ? 'Update Question' : 'Add Question'}
        </button>
      </div>
    </form>
  );
};

export default TrueFalseCreator;