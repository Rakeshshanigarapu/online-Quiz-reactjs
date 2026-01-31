// src/utils/storage.js
const QUIZ_STORAGE_KEY = 'quiz_app_quizzes';
const RESULTS_STORAGE_KEY = 'quiz_app_results';

export const storage = {
  // Quiz Management
  saveQuiz(quiz) {
    const quizzes = this.getAllQuizzes();
    quiz.id = quiz.id || `quiz_${Date.now()}`;
    quiz.createdAt = quiz.createdAt || new Date().toISOString();
    quiz.updatedAt = new Date().toISOString();
    
    // Check if updating existing quiz
    const existingIndex = quizzes.findIndex(q => q.id === quiz.id);
    if (existingIndex >= 0) {
      quizzes[existingIndex] = quiz;
    } else {
      quizzes.push(quiz);
    }
    
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(quizzes));
    return quiz;
  },

  getAllQuizzes() {
    const data = localStorage.getItem(QUIZ_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getQuizById(id) {
    const quizzes = this.getAllQuizzes();
    return quizzes.find(q => q.id === id);
  },

  deleteQuiz(id) {
    const quizzes = this.getAllQuizzes();
    const filtered = quizzes.filter(q => q.id !== id);
    localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(filtered));
  },

  // Results Management
  saveResult(result) {
    const results = this.getAllResults();
    result.id = `result_${Date.now()}`;
    result.timestamp = new Date().toISOString();
    results.push(result);
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(results));
    return result;
  },

  getAllResults() {
    const data = localStorage.getItem(RESULTS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getResultsByQuizId(quizId) {
    const results = this.getAllResults();
    return results.filter(r => r.quizId === quizId);
  },

  // Clear all data
  clearAllData() {
    localStorage.removeItem(QUIZ_STORAGE_KEY);
    localStorage.removeItem(RESULTS_STORAGE_KEY);
  },

  // Export/Import
  exportData() {
    return {
      quizzes: this.getAllQuizzes(),
      results: this.getAllResults()
    };
  },

  importData(data) {
    if (data.quizzes) {
      localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(data.quizzes));
    }
    if (data.results) {
      localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(data.results));
    }
  }
};

// Question Types Configuration
export const QUESTION_TYPES = {
  MCQ: {
    id: 'MCQ',
    name: 'Multiple Choice (Single)',
    icon: 'bi-check-circle',
    description: 'Choose one correct answer from options'
  },
  MULTI_SELECT: {
    id: 'MULTI_SELECT',
    name: 'Multiple Choice (Multi-select)',
    icon: 'bi-check2-all',
    description: 'Select all correct answers'
  },
  TRUE_FALSE: {
    id: 'TRUE_FALSE',
    name: 'True/False',
    icon: 'bi-toggle-on',
    description: 'Select True or False'
  },
  DESCRIPTIVE: {
    id: 'DESCRIPTIVE',
    name: 'Descriptive/Open-ended',
    icon: 'bi-text-paragraph',
    description: 'Write detailed answer'
  },
  FILL_BLANK: {
    id: 'FILL_BLANK',
    name: 'Fill in the Blank',
    icon: 'bi-input-cursor-text',
    description: 'Fill missing words'
  },
  MATCHING: {
    id: 'MATCHING',
    name: 'Matching',
    icon: 'bi-arrow-left-right',
    description: 'Match items from two columns'
  },
  RANKING: {
    id: 'RANKING',
    name: 'Ranking',
    icon: 'bi-sort-numeric-down',
    description: 'Rank items in correct order'
  },
  IMAGE_BASED: {
    id: 'IMAGE_BASED',
    name: 'Image-Based',
    icon: 'bi-image',
    description: 'Question based on image'
  },
  RC: {
    id: 'RC',
    name: 'Reading Comprehension',
    icon: 'bi-book',
    description: 'Passage with questions'
  },
  DI: {
    id: 'DI',
    name: 'Data Interpretation',
    icon: 'bi-bar-chart',
    description: 'Charts/Graphs with questions'
  }
};