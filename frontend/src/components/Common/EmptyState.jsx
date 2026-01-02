import React from 'react';
import { FileX } from 'lucide-react';

const EmptyState = ({ 
  icon: Icon = FileX,
  title = 'Ma\'lumot topilmadi',
  description,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-20 h-20 bg-gray-100 dark:bg-dark-800 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 text-center mb-6">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;