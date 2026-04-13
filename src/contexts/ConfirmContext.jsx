import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmContext = createContext();

export const useConfirm = () => useContext(ConfirmContext);

export const ConfirmProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState({});
  const resolver = useRef(null);

  const confirm = useCallback((message, title = 'Atenção') => {
    setOptions({ message, title });
    setIsOpen(true);
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleConfirm = () => {
    resolver.current?.(true);
    setIsOpen(false);
  };

  const handleCancel = () => {
    resolver.current?.(false);
    setIsOpen(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={handleCancel}>
          <div 
            className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl border border-gray-100 dark:border-surface-700 w-full max-w-sm overflow-hidden transform transition-all"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-expense-50 dark:bg-expense-500/10 text-expense-600 dark:text-expense-400 flex items-center justify-center mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">{options.title}</h2>
              <p className="text-surface-500 dark:text-surface-400 text-sm mb-6">{options.message}</p>
              
              <div className="flex gap-3">
                <button 
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 font-semibold text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleConfirm}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-expense-500 hover:bg-expense-600 text-white font-semibold shadow-sm transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
