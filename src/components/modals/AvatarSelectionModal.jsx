import React from 'react';
import { X } from 'lucide-react';
import AvatarCarousel from '../ui/AvatarCarousel';

const AvatarSelectionModal = ({ isOpen, onClose, selectedAvatar, setSelectedAvatar, profileBgColor, setProfileBgColor }) => {
    if (!isOpen) return null;

    // Predefined background color options
    const bgColors = [
        { name: 'Purple', gradient: 'linear-gradient(to bottom, #7e22ce, #581c87)' },
        { name: 'Blue', gradient: 'linear-gradient(to bottom, #0369a1, #1e40af)' },
        { name: 'Red', gradient: 'linear-gradient(to bottom, #b91c1c, #9a3412)' },
        { name: 'Green', gradient: 'linear-gradient(to bottom, #059669, #15803d)' },
        { name: 'Pink', gradient: 'linear-gradient(to bottom, #db2777, #be123c)' },
        { name: 'Orange', gradient: 'linear-gradient(to bottom, #ea580c, #c2410c)' },
        { name: 'Teal', gradient: 'linear-gradient(to bottom, #0d9488, #115e59)' },
        { name: 'Indigo', gradient: 'linear-gradient(to bottom, #4f46e5, #3730a3)' }
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-3xl">
                <div className="bg-[#0f172a]/95 backdrop-blur-xl border-4 border-slate-700 rounded-xl shadow-2xl p-6">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6 border-b-2 border-slate-700 pb-4">
                        <h2 className="text-3xl text-yellow-400 font-bold uppercase tracking-widest" style={{ fontFamily: '"VT323", monospace' }}>
                            Choose Your Avatar
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all hover:scale-110"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Avatar Carousel */}
                    <AvatarCarousel
                        selectedAvatar={selectedAvatar}
                        setSelectedAvatar={setSelectedAvatar}
                    />

                    {/* Background Color Picker */}
                    <div className="mt-6 bg-slate-800/50 rounded-lg border-2 border-slate-600 p-4">
                        <h3 className="text-xl text-yellow-400 font-bold uppercase tracking-wider mb-3" style={{ fontFamily: '"VT323", monospace' }}>
                            Background Color
                        </h3>
                        <div className="grid grid-cols-4 gap-3">
                            {bgColors.map((color) => (
                                <button
                                    key={color.name}
                                    onClick={() => setProfileBgColor(color.gradient)}
                                    className={`relative h-16 rounded-lg border-2 transition-all ${profileBgColor === color.gradient
                                            ? 'border-yellow-400 ring-2 ring-yellow-400/20 scale-105'
                                            : 'border-slate-600 hover:border-yellow-400/50 hover:scale-105'
                                        }`}
                                    style={{ background: color.gradient }}
                                    title={color.name}
                                >
                                    {/* Texture overlay */}
                                    <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] rounded-lg"></div>

                                    {/* Checkmark for selected */}
                                    {profileBgColor === color.gradient && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-yellow-400 text-black text-sm font-bold w-6 h-6 rounded-full flex items-center justify-center">
                                                ✓
                                            </div>
                                        </div>
                                    )}

                                    {/* Color name */}
                                    <div className="absolute bottom-1 left-0 right-0 text-center text-xs text-white font-bold drop-shadow-lg">
                                        {color.name}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Close Button */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-lg uppercase tracking-wider transition-all hover:scale-105"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AvatarSelectionModal;
