// src/components/QuestionTypes/MatchingCreator.js
import React, { useState, useEffect } from 'react';

const MatchingCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'MATCHING',
    instruction: 'Match the items in Column A with their corresponding items in Column B',
    items: [
      { id: 1, left: '', right: '' },
      { id: 2, left: '', right: '' },
      { id: 3, left: '', right: '' }
    ],
    points: 1,
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) setQuestion(initialData);
  }, [initialData]);

  const addItem = () => {
    const newId = Math.max(...question.items.map(item => item.id)) + 1;
    setQuestion({
      ...question,
      items: [...question.items, { id: newId, left: '', right: '' }]
    });
  };

  const removeItem = (id) => {
    if (question.items.length <= 2) {
      alert('Minimum 2 items required');
      return;
    }
    const updatedItems = question.items.filter(item => item.id !== id);
    setQuestion({ ...question, items: updatedItems });
  };

  const updateItem = (id, field, value) => {
    const updatedItems = question.items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setQuestion({ ...question, items: updatedItems });
  };

  const shuffleItems = () => {
    const shuffledRights = [...question.items]
      .map(item => item.right)
      .sort(() => Math.random() - 0.5);
    
    const updatedItems = question.items.map((item, index) => ({
      ...item,
      right: shuffledRights[index]
    }));
    
    setQuestion({ ...question, items: updatedItems });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate instruction
    if (!question.instruction.trim()) {
      alert('Please enter instructions');
      return;
    }

    // Validate all items
    const emptyItems = question.items.filter(item => !item.left.trim() || !item.right.trim());
    if (emptyItems.length > 0) {
      alert('Please fill all items in both columns');
      return;
    }

    // Check for duplicates in left column
    const leftItems = question.items.map(item => item.left.toLowerCase());
    const hasDuplicates = new Set(leftItems).size !== leftItems.length;
    if (hasDuplicates) {
      alert('Duplicate items found in Column A');
      return;
    }

    // Prepare final question with correct matches
    const correctMatches = question.items.map(item => ({
      left: item.left,
      right: item.right
    }));

    const finalQuestion = {
      ...question,
      correctMatches,
      items: question.items.map(item => ({ left: item.left, right: '' })) // Shuffle right column for quiz
    };

    onSave(finalQuestion);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Instructions *</label>
        <input
          type="text"
          className="form-control"
          value={question.instruction}
          onChange={(e) => setQuestion({...question, instruction: e.target.value})}
          placeholder="e.g., Match the countries with their capitals"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Matching Items *</label>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th width="45%">Column A</th>
                <th width="45%">Column B</th>
                <th width="10%">Actions</th>
              </tr>
            </thead>
            <tbody>
              {question.items.map((item, index) => (
                <tr key={item.id}>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={item.left}
                      onChange={(e) => updateItem(item.id, 'left', e.target.value)}
                      placeholder={`Item ${index + 1} in Column A`}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={item.right}
                      onChange={(e) => updateItem(item.id, 'right', e.target.value)}
                      placeholder={`Matching item for Column A`}
                      required
                    />
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(item.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="d-flex gap-2">
          <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addItem}>
            <i className="bi bi-plus"></i> Add Item
          </button>
          <button type="button" className="btn btn-sm btn-outline-info" onClick={shuffleItems}>
            <i className="bi bi-shuffle"></i> Shuffle Column B
          </button>
        </div>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Points per Match *</label>
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

export default MatchingCreator;