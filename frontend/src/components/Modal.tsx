import React from 'react';
import ReactModal from 'react-modal';
ReactModal.setAppElement('#root');

export default function Modal({ isOpen, onRequestClose, children, title }: any) {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: { backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000 },
        content: { background: '#071428', borderRadius: 8, padding: 16, maxWidth: 900, margin: 'auto', inset: 'auto' }
      }}
    >
      {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
      {children}
    </ReactModal>
  );
}
