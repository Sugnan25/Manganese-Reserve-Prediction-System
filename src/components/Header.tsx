import React from 'react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'predictor', label: 'Predict Reserve' },
    { id: 'models', label: 'Compare Models (LR vs RF)' },
    { id: 'dataset', label: 'Dataset & Records' },
    { id: 'map', label: 'Manganese Zones Map' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Project Title */}
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Manganese Reserve Prediction System
              </h1>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                Satellite & ML
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Identifying new reserves early to overcome manganese production shortfalls
            </p>
          </div>

          {/* Simple subtitle status */}
          <div className="hidden md:flex items-center space-x-3 text-xs text-slate-500">
            <span>Linear Regression & Random Forest</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex space-x-1 border-t border-slate-100 overflow-x-auto py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
