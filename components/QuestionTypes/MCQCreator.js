// src/components/QuestionTypes/MCQCreator.js
import React, { useState, useEffect } from 'react';

const MCQCreator = ({ initialData, onSave, onCancel, multiSelect = false }) => {
  const [question, setQuestion] = useState({
    type: multiSelect ? 'MULTI_SELECT' : 'MCQ',
    text: '',
    options: [
      { id: 1, text: '', isCorrect: false },
      { id: 2, text: '', isCorrect: false },
      { id: 3, text: '', isCorrect: false },
      { id: 4, text: '', isCorrect: false }
    ],
    points: 1,
    explanation: '',
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) {
      setQuestion(initialData);
    }
  }, [initialData]);

  const handleOptionChange = (id, field, value) => {
    const updatedOptions = question.options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    );
    setQuestion({ ...question, options: updatedOptions });
  };

  const handleCorrectAnswerChange = (id) => {
    const updatedOptions = question.options.map(opt => {
      if (multiSelect) {
        // For multi-select, toggle the correct state
        return opt.id === id ? { ...opt, isCorrect: !opt.isCorrect } : opt;
      } else {
        // For single select, set only this option as correct
        return { ...opt, isCorrect: opt.id === id };
      }
    });
    setQuestion({ ...question, options: updatedOptions });
  };

  const addOption = () => {
    const newId = Math.max(...question.options.map(o => o.id)) + 1;
    setQuestion({
      ...question,
      options: [...question.options, { id: newId, text: '', isCorrect: false }]
    });
  };

  const removeOption = (id) => {
    if (question.options.length <= 2) {
      alert('Minimum 2 options required');
      return;
    }
    const updatedOptions = question.options.filter(opt => opt.id !== id);
    setQuestion({ ...question, options: updatedOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate question text
    if (!question.text.trim()) {
      alert('Please enter question text');
      return;
    }

    // Validate options
    const emptyOptions = question.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      alert('Please fill all options');
      return;
    }

    // Validate at least one correct answer
    const correctOptions = question.options.filter(opt => opt.isCorrect);
    if (correctOptions.length === 0) {
      alert('Please select at least one correct answer');
      return;
    }

    // Prepare final question object
    const finalQuestion = {
      ...question,
      correctAnswer: multiSelect 
        ? correctOptions.map(opt => opt.id - 1) // Store indices of correct options
        : question.options.findIndex(opt => opt.isCorrect)
    };

    onSave(finalQuestion);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Question Text *</label>
        <textarea
          className="form-control"
          value={question.text}
          onChange={(e) => setQuestion({...question, text: e.target.value})}
          rows="3"
          placeholder="Enter your question here..."
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          Options {multiSelect ? '(Select all that apply)' : '(Select one correct answer)'} *
        </label>
        {question.options.map((option, index) => (
          <div key={option.id} className="input-group mb-2">
            <div className="input-group-text">
              {multiSelect ? (
                <input
                  type="checkbox"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(option.id)}
                  className="form-check-input mt-0"
                />
              ) : (
                <input
                  type="radio"
                  name="correctOption"
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(option.id)}
                  className="form-check-input mt-0"
                />
              )}
            </div>
            <input
              type="text"
              className="form-control"
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
              required
            />
            {question.options.length > 2 && (
              <button
                type="button"
                className="btn btn-outline-danger"
                onClick={() => removeOption(option.id)}
              >
                <i className="bi bi-trash"></i>
              </button>
            )}
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addOption}>
          <i className="bi bi-plus"></i> Add Another Option
        </button>
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
          placeholder="Explain why this is the correct answer..."
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

export default MCQCreator;