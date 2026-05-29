import React from 'react';

export default function Panel({ children, className = '', ...props }) {
  return (
    <div
      className={`glass-panel border-r border-darkBorder flex flex-col h-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
