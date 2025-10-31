import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-d-base-200 rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 sm:p-8 relative transform transition-all duration-300 animate-modal-pop"
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-text-primary dark:text-d-text-primary">{title}</h2>
                    <button onClick={onClose} className="text-text-secondary dark:text-d-text-secondary hover:text-text-primary dark:hover:text-d-text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

// Add animation to CSS
const style = `
@keyframes modal-pop {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
.animate-modal-pop {
  animation: modal-pop 0.3s ease-out forwards;
}
`;

const styleId = 'modal-animation-style';
if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = style;
    document.head.appendChild(styleSheet);
}


export default Modal;