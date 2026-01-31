// src/components/QuestionTypes/DescriptiveCreator.js
import React, { useState, useEffect } from 'react';

const DescriptiveCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'DESCRIPTIVE',
    text: '',
    minWords: 50,
    maxWords: 500,
    points: 10,
    sampleAnswer: '',
    keywords: [],
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) setQuestion(initialData);
  }, [initialData]);

  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = () => {
    if (newKeyword.trim() && !question.keywords.includes(newKeyword.trim())) {
      setQuestion({
        ...question,
        keywords: [...question.keywords, newKeyword.trim()]
      });
      setNewKeyword('');
    }
  };

  const removeKeyword = (index) => {
    setQuestion({
      ...question,
      keywords: question.keywords.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.text.trim()) {
      alert('Please enter question text');
      return;
    }
    if (question.minWords > question.maxWords) {
      alert('Minimum words cannot be greater than maximum words');
      return;
    }
    onSave(question);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Question/Prompt *</label>
        <textarea
          className="form-control"
          value={question.text}
          onChange={(e) => setQuestion({...question, text: e.target.value})}
          rows="4"
          placeholder="Ask a question that requires a detailed answer..."
          required
        />
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Minimum Words</label>
          <input
            type="number"
            className="form-control"
            value={question.minWords}
            onChange={(e) => setQuestion({...question, minWords: parseInt(e.target.value) || 0})}
            min="0"
          />
        </div>
        <div className="col-md-6">
          <label className="form-label">Maximum Words</label>
          <input
            type="number"
            className="form-control"
            value={question.maxWords}
            onChange={(e) => setQuestion({...question, maxWords: parseInt(e.target.value) || 500})}
            min={question.minWords}
          />
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Points *</label>
          <input
            type="number"
            className="form-control"
            value={question.points}
            onChange={(e) => setQuestion({...question, points: parseInt(e.target.value) || 10})}
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
        <label className="form-label">Keywords for Evaluation</label>
        <div className="input-group mb-2">
          <input
            type="text"
            className="form-control"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Add important keywords for auto-grading..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
          />
          <button type="button" className="btn btn-outline-secondary" onClick={addKeyword}>
            Add
          </button>
        </div>
        {question.keywords.length > 0 && (
          <div className="d-flex flex-wrap gap-1 mb-3">
            {question.keywords.map((kw, index) => (
              <span key={index} className="badge bg-info">
                {kw}
                <button 
                  type="button" 
                  className="btn-close btn-close-white ms-1"
                  style={{ fontSize: '0.6rem' }}
                  onClick={() => removeKeyword(index)}
                ></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Sample Answer (Optional)</label>
        <textarea
          className="form-control"
          value={question.sampleAnswer}
          onChange={(e) => setQuestion({...question, sampleAnswer: e.target.value})}
          rows="3"
          placeholder="Provide a model answer for reference..."
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

export default DescriptiveCreator;