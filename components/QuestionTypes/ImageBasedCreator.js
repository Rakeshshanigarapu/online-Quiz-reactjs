// src/components/QuestionTypes/ImageBasedCreator.js
import React, { useState, useEffect } from 'react';

const ImageBasedCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'IMAGE_BASED',
    text: '',
    imageUrl: '',
    imageFile: null,
    options: [
      { id: 1, text: '', isCorrect: false },
      { id: 2, text: '', isCorrect: false },
      { id: 3, text: '', isCorrect: false },
      { id: 4, text: '', isCorrect: false }
    ],
    points: 2,
    explanation: '',
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) setQuestion(initialData);
  }, [initialData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setQuestion({
          ...question,
          imageUrl: event.target.result,
          imageFile: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOptionChange = (id, field, value) => {
    const updatedOptions = question.options.map(opt => 
      opt.id === id ? { ...opt, [field]: value } : opt
    );
    setQuestion({ ...question, options: updatedOptions });
  };

  const handleCorrectAnswerChange = (id) => {
    const updatedOptions = question.options.map(opt => ({
      ...opt,
      isCorrect: opt.id === id
    }));
    setQuestion({ ...question, options: updatedOptions });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.text.trim()) {
      alert('Please enter question text');
      return;
    }

    if (!question.imageUrl) {
      alert('Please upload an image');
      return;
    }

    const emptyOptions = question.options.filter(opt => !opt.text.trim());
    if (emptyOptions.length > 0) {
      alert('Please fill all options');
      return;
    }

    const correctOption = question.options.find(opt => opt.isCorrect);
    if (!correctOption) {
      alert('Please select a correct answer');
      return;
    }

    const finalQuestion = {
      ...question,
      correctAnswer: question.options.findIndex(opt => opt.isCorrect)
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
          rows="2"
          placeholder="What would you like to ask about this image?"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Upload Image *</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={handleImageUpload}
        />
        <div className="form-text">
          Supported formats: JPG, PNG, GIF. Max size: 5MB
        </div>
        
        {question.imageUrl && (
          <div className="mt-3">
            <div className="card">
              <div className="card-body text-center">
                <img 
                  src={question.imageUrl} 
                  alt="Preview" 
                  className="img-fluid rounded"
                  style={{ maxHeight: '300px', maxWidth: '100%' }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">Options *</label>
        {question.options.map((option, index) => (
          <div key={option.id} className="input-group mb-2">
            <div className="input-group-text">
              <input
                type="radio"
                name="imageCorrectAnswer"
                checked={option.isCorrect}
                onChange={() => handleCorrectAnswerChange(option.id)}
                className="form-check-input mt-0"
              />
            </div>
            <input
              type="text"
              className="form-control"
              placeholder={`Option ${index + 1}`}
              value={option.text}
              onChange={(e) => handleOptionChange(option.id, 'text', e.target.value)}
              required
            />
          </div>
        ))}
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <label className="form-label">Points *</label>
          <input
            type="number"
            className="form-control"
            value={question.points}
            onChange={(e) => setQuestion({...question, points: parseInt(e.target.value) || 2})}
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
          placeholder="Explain the answer..."
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

export default ImageBasedCreator;