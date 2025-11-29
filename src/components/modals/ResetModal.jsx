import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ResetModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-stone-900 border-4 border-red-600 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors">
                    <X size={24} />
                </button>
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-600/20 p-4 rounded-full mb-4 border-2 border-red-600">
                        <AlertTriangle size={48} className="text-red-500" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-400 uppercase tracking-wider mb-4">Delete Progress?</h2>
                    <p className="text-stone-300 mb-8">Are you sure you want to delete all progress for this profile? This action cannot be undone!</p>
                    <div className="flex gap-4 w-full">
                        <button onClick={onClose} className="flex-1 bg-stone-700 hover:bg-stone-600 text-white py-3 px-6 rounded-lg font-bold uppercase tracking-wider transition-all border-2 border-stone-500">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-6 rounded-lg font-bold uppercase tracking-wider transition-all border-2 border-red-400">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetModal;
