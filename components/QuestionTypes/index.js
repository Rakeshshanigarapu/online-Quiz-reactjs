// src/components/QuestionTypes/index.js
import React, { useState, useEffect } from 'react';

// Question Type Components
import MCQCreator from './MCQCreator';
import TrueFalseCreator from './TrueFalseCreator';
import DescriptiveCreator from './DescriptiveCreator';
import ImageBasedCreator from './ImageBasedCreator';
import ReadingComprehensionCreator from './ReadingComprehensionCreator';
import DataInterpretationCreator from './DataInterpretationCreator';
import FillBlankCreator from './FillBlankCreator';
import MatchingCreator from './MatchingCreator';
import RankingCreator from './RankingCreator';

const QuestionCreator = ({ type, initialData, onSave, onCancel }) => {
  const renderComponent = () => {
    switch (type) {
      case 'MCQ':
        return <MCQCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'MULTI_SELECT':
        return <MCQCreator initialData={initialData} onSave={onSave} onCancel={onCancel} multiSelect={true} />;
      case 'TRUE_FALSE':
        return <TrueFalseCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'DESCRIPTIVE':
        return <DescriptiveCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'FILL_BLANK':
        return <FillBlankCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'MATCHING':
        return <MatchingCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'RANKING':
        return <RankingCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'IMAGE_BASED':
        return <ImageBasedCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'RC':
        return <ReadingComprehensionCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      case 'DI':
        return <DataInterpretationCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
      default:
        return <MCQCreator initialData={initialData} onSave={onSave} onCancel={onCancel} />;
    }
  };

  return <div>{renderComponent()}</div>;
};

export default QuestionCreator;