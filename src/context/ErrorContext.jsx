import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import ErrorModal from '../components/ErrorModal';
import { setGlobalErrorHandler } from '../api';

const ErrorContext = createContext(null);

export function ErrorProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    error: null,
    onRetry: null,
  });

  const showError = useCallback(({ title, message, status, details, endpoint, onRetry }) => {
    setModalState({
      isOpen: true,
      error: {
        title: title || 'Application Error',
        message: message || 'An unexpected error occurred.',
        status: status || null,
        details: details || null,
        endpoint: endpoint || null,
      },
      onRetry: onRetry || null,
    });
  }, []);

  const closeError = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  // Register with API module so all unhandled HTTP failures pop up automatically
  useEffect(() => {
    setGlobalErrorHandler((errorPayload) => {
      showError(errorPayload);
    });
  }, [showError]);

  return (
    <ErrorContext.Provider value={{ showError, closeError }}>
      {children}
      {modalState.isOpen && (
        <ErrorModal 
          error={modalState.error} 
          onClose={closeError} 
          onRetry={modalState.onRetry} 
        />
      )}
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}
