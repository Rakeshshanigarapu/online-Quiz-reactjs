// src/components/QuestionTypes/FillBlankCreator.js
import React, { useState, useEffect } from 'react';

const FillBlankCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'FILL_BLANK',
    text: '',
    blanks: [{ position: 0, correctAnswer: '', hint: '' }],
    points: 1,
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) setQuestion(initialData);
  }, [initialData]);

  const addBlank = () => {
    setQuestion({
      ...question,
      blanks: [...question.blanks, { position: question.blanks.length, correctAnswer: '', hint: '' }]
    });
  };

  const removeBlank = (index) => {
    if (question.blanks.length <= 1) {
      alert('At least one blank is required');
      return;
    }
    const updatedBlanks = question.blanks.filter((_, i) => i !== index);
    setQuestion({ ...question, blanks: updatedBlanks });
  };

  const updateBlank = (index, field, value) => {
    const updatedBlanks = [...question.blanks];
    updatedBlanks[index] = { ...updatedBlanks[index], [field]: value };
    setQuestion({ ...question, blanks: updatedBlanks });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question.text.trim()) {
      alert('Please enter question text');
      return;
    }
    const emptyBlanks = question.blanks.filter(blank => !blank.correctAnswer.trim());
    if (emptyBlanks.length > 0) {
      alert('Please fill correct answers for all blanks');
      return;
    }
    onSave(question);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Question Text with Blanks *</label>
        <textarea
          className="form-control"
          value={question.text}
          onChange={(e) => setQuestion({...question, text: e.target.value})}
          rows="3"
          placeholder="Write your sentence with blanks indicated by underscores, e.g., 'The capital of France is ______.'"
          required
        />
        <div className="form-text">
          Use underscores (______) to indicate blanks in your text
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Blanks Configuration</label>
        {question.blanks.map((blank, index) => (
          <div key={index} className="card mb-2">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Blank {index + 1}</h6>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => removeBlank(index)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </div>
              <div className="row g-2">
                <div className="col-md-6">
                  <label className="form-label">Correct Answer *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={blank.correctAnswer}
                    onChange={(e) => updateBlank(index, 'correctAnswer', e.target.value)}
                    placeholder="Expected answer"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Hint (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={blank.hint}
                    onChange={(e) => updateBlank(index, 'hint', e.target.value)}
                    placeholder="Hint for the blank"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addBlank}>
          <i className="bi bi-plus"></i> Add Another Blank
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Points per Blank *</label>
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

export default FillBlankCreator;