// ==========================================
// FILE: src/components/EmptyState/EmptyState.jsx
// ==========================================
import React from 'react';
import './EmptyState.css';

const EmptyState = ({ 
  icon = 'bi-inbox', 
  title = 'No items found', 
  message = 'Try adjusting your search or filters.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="empty-state text-center py-5">
      <i className={`bi ${icon} empty-state-icon text-muted mb-3`}></i>
      <h4 className="empty-state-title text-muted">{title}</h4>
      <p className="empty-state-message text-muted">{message}</p>
      {actionLabel && onAction && (
        <button className="btn btn-outline-success" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
