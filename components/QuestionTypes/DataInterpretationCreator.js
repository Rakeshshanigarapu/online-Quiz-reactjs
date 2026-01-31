// src/components/QuestionTypes/DataInterpretationCreator.js
import React, { useState, useEffect } from 'react';

const DataInterpretationCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'DI',
    title: '',
    dataType: 'table',
    data: '',
    questions: [
      { id: 1, text: '', answer: '', points: 1, answerType: 'number' }
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
        { id: newId, text: '', answer: '', points: 1, answerType: 'number' }
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
    
    const totalPts = updatedQuestions.reduce((sum, q) => sum + (q.points || 1), 0);
    
    setQuestion({
      ...question,
      questions: updatedQuestions,
      totalPoints: totalPts
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.title.trim()) {
      alert('Please enter a title for the data');
      return;
    }

    if (!question.data.trim()) {
      alert('Please enter the data/table');
      return;
    }

    // Validate all questions
    for (let q of question.questions) {
      if (!q.text.trim()) {
        alert('Please fill all question texts');
        return;
      }
      if (!q.answer.trim()) {
        alert('Please fill correct answers for all questions');
        return;
      }
    }

    onSave(question);
  };

  const getDataTypeLabel = () => {
    switch (question.dataType) {
      case 'table': return 'Table Data';
      case 'chart': return 'Chart/Graph Description';
      case 'text': return 'Textual Data';
      default: return 'Data';
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Data Set Title *</label>
        <input
          type="text"
          className="form-control"
          value={question.title}
          onChange={(e) => setQuestion({...question, title: e.target.value})}
          placeholder="e.g., Company Sales Data 2023"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Data Type</label>
        <select
          className="form-select"
          value={question.dataType}
          onChange={(e) => setQuestion({...question, dataType: e.target.value})}
        >
          <option value="table">Table</option>
          <option value="chart">Chart/Graph</option>
          <option value="text">Textual Data</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">{getDataTypeLabel()} *</label>
        <textarea
          className="form-control font-monospace"
          value={question.data}
          onChange={(e) => setQuestion({...question, data: e.target.value})}
          rows="8"
          placeholder={
            question.dataType === 'table' 
              ? `Example table format:
Month     | Sales | Expenses
----------|-------|---------
January   | 5000  | 3000
February  | 6000  | 3500
March     | 7500  | 4000`
              : question.dataType === 'chart'
              ? `Describe the chart/graph:
Bar chart showing quarterly sales:
Q1: $50,000
Q2: $65,000
Q3: $70,000
Q4: $85,000`
              : `Enter textual data here:
The population of City A increased by 15% from 2020 to 2023...
`
          }
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Interpretation Questions</label>
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
              <div className="mb-3">
                <label className="form-label">Question Text *</label>
                <textarea
                  className="form-control"
                  value={q.text}
                  onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                  rows="2"
                  placeholder="e.g., What was the total sales in Q3?"
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-6">
                  <label className="form-label">Correct Answer *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={q.answer}
                    onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                    placeholder="Expected answer"
                    required
                  />
                  <div className="form-text">
                    For calculations, specify the exact expected value
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Answer Type</label>
                  <select
                    className="form-select"
                    value={q.answerType}
                    onChange={(e) => updateQuestion(q.id, 'answerType', e.target.value)}
                  >
                    <option value="number">Number</option>
                    <option value="text">Text</option>
                    <option value="percentage">Percentage</option>
                    <option value="currency">Currency</option>
                  </select>
                </div>
                <div className="col-md-3">
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
          {initialData ? 'Update Data Set' : 'Add Data Interpretation'}
        </button>
      </div>
    </form>
  );
};

export default DataInterpretationCreator;