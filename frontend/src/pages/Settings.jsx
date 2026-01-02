import React from 'react';
import { useTheme, platformColors } from '../contexts/ThemeContext';
import { 
  Settings as SettingsIcon,
  Moon, 
  Sun,
  Palette,
  Check
} from 'lucide-react';

const Settings = () => {
  const { isDark, toggleTheme, primaryColor, setColor, colorConfig } = useTheme();

  return (
    <div className="w-full space-y-4 lg:space-y-6 pb-24 sm:pb-8">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm lg:shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 lg:gap-4">
          <div 
            className="p-2.5 lg:p-3 rounded-xl lg:rounded-2xl shadow-lg"
            style={{ backgroundColor: colorConfig?.primary || '#3B82F6' }}
          >
            <SettingsIcon className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">Sozlamalar</h1>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Ilovani shaxsiylashtiring</p>
          </div>
        </div>
      </div>

      {/* Tema - Och/Qora */}
      <div className="bg-white dark:bg-gray-800 rounded-xl lg:rounded-2xl p-4 lg:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gray-100 dark:bg-gray-700 rounded-xl lg:rounded-2xl flex items-center justify-center">
            {isDark ? <Moon className="w-5 h-5 lg:w-6 lg:h-6 text-indigo-500" /> : <Sun className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-500" />}
          </div>
          <div>
            <h3 className="text-base lg:text-lg font-bold text-gray-900 dark:text-white">Tema</h3>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Och yoki qora rejim</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => isDark && toggleTheme()}
            className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              !isDark 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-white rounded-xl shadow-md flex items-center justify-center">
              <Sun className="w-6 h-6 lg:w-7 lg:h-7 text-yellow-500" />
            </div>
            <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Och</span>
            {!isDark && <Check className="w-4 h-4 text-blue-500" />}
          </button>
          
          <button
            onClick={() => !isDark && toggleTheme()}
            className={`p-4 lg:p-5 rounded-xl lg:rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
              isDark 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-800 rounded-xl shadow-md flex items-center justify-center">
              <Moon className="w-6 h-6 lg:w-7 lg:h-7 text-indigo-400" />
            </div>
            <span className="text-sm lg:text-base font-medium text-gray-900 dark:text-white">Qora</span>
            {isDark && <Check className="w-4 h-4 text-blue-500" />}
          </button>
        </div>
      </div>

      {/* Platforma rangi */}


      {/* Ilova haqida */}
    </div>
  );
};

export default Settings;