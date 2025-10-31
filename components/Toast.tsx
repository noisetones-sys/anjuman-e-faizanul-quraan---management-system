import React, { useEffect } from 'react';

interface ToastProps {
    message: string;
    show: boolean;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) {
        return null;
    }

    return (
        <div className="fixed bottom-5 right-5 bg-text-primary dark:bg-d-text-primary text-base-100 dark:text-d-base-100 py-3 px-6 rounded-full shadow-2xl animate-fade-in-out">
            {message}
        </div>
    );
};

// Add this to your index.html <style> tag or a CSS file if you prefer
const style = `
@keyframes fade-in-out {
  0% { opacity: 0; transform: translateY(20px); }
  10% { opacity: 1; transform: translateY(0); }
  90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
.animate-fade-in-out {
  animation: fade-in-out 3s forwards;
}
`;

// A bit of a hack to inject style, but works for single-file structure
const styleSheet = document.createElement("style");
styleSheet.innerText = style;
document.head.appendChild(styleSheet);


export default Toast;