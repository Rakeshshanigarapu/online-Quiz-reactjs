// src/components/QuestionTypes/RankingCreator.js
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const RankingCreator = ({ initialData, onSave, onCancel }) => {
  const [question, setQuestion] = useState({
    type: 'RANKING',
    instruction: 'Arrange the following items in the correct order',
    items: [
      { id: '1', text: 'Item 1' },
      { id: '2', text: 'Item 2' },
      { id: '3', text: 'Item 3' }
    ],
    correctOrder: ['1', '2', '3'],
    points: 1,
    difficulty: 'Medium'
  });

  useEffect(() => {
    if (initialData) setQuestion(initialData);
  }, [initialData]);

  const addItem = () => {
    const newId = (Math.max(...question.items.map(item => parseInt(item.id))) + 1).toString();
    setQuestion({
      ...question,
      items: [...question.items, { id: newId, text: `Item ${newId}` }],
      correctOrder: [...question.correctOrder, newId]
    });
  };

  const removeItem = (id) => {
    if (question.items.length <= 2) {
      alert('Minimum 2 items required');
      return;
    }
    const updatedItems = question.items.filter(item => item.id !== id);
    const updatedOrder = question.correctOrder.filter(itemId => itemId !== id);
    setQuestion({
      ...question,
      items: updatedItems,
      correctOrder: updatedOrder
    });
  };

  const updateItem = (id, text) => {
    const updatedItems = question.items.map(item => 
      item.id === id ? { ...item, text } : item
    );
    setQuestion({ ...question, items: updatedItems });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(question.correctOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setQuestion({
      ...question,
      correctOrder: items
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!question.instruction.trim()) {
      alert('Please enter instructions');
      return;
    }

    const emptyItems = question.items.filter(item => !item.text.trim());
    if (emptyItems.length > 0) {
      alert('Please fill all items');
      return;
    }

    onSave(question);
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
          placeholder="e.g., Arrange the steps in chronological order"
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Items to Rank *</label>
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th width="10%">Order</th>
                <th width="75%">Item Text</th>
                <th width="15%">Actions</th>
              </tr>
            </thead>
            <tbody>
              {question.items.map((item, index) => (
                <tr key={item.id}>
                  <td className="text-center">
                    <span className="badge bg-primary">{index + 1}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control"
                      value={item.text}
                      onChange={(e) => updateItem(item.id, e.target.value)}
                      placeholder={`Item ${index + 1}`}
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
        <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addItem}>
          <i className="bi bi-plus"></i> Add Item
        </button>
      </div>

      <div className="mb-3">
        <label className="form-label">Correct Order</label>
        <div className="card">
          <div className="card-body">
            <p className="text-muted mb-2">Drag to reorder items into correct sequence:</p>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="correctOrder">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="list-group"
                  >
                    {question.correctOrder.map((itemId, index) => {
                      const item = question.items.find(i => i.id === itemId);
                      return (
                        <Draggable key={itemId} draggableId={itemId} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              <div>
                                <span className="badge bg-secondary me-2">{index + 1}</span>
                                {item?.text || 'Item not found'}
                              </div>
                              <i className="bi bi-grip-vertical text-muted"></i>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
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

export default RankingCreator;