import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (date: string) => void;
    placeholder?: string;
}

const ARABIC_MONTHS = [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"
];

const ARABIC_DAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, placeholder = "اختر التاريخ" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    // Sync viewDate with value when opened
    useEffect(() => {
        if (isOpen && value) {
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
                setViewDate(d);
            }
        } else if (isOpen && !value) {
            setViewDate(new Date());
        }
    }, [isOpen, value]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getDaysInMonth = (year: number, month: number) => {
        const date = new Date(year, month, 1);
        const days = [];
        
        const firstDay = date.getDay(); // 0 = Sunday
        
        // Previous month days
        const prevMonthDays = new Date(year, month, 0).getDate();
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false
            });
        }
        
        // Current month days
        const currentMonthDays = new Date(year, month + 1, 0).getDate();
        for (let i = 1; i <= currentMonthDays; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true
            });
        }
        
        // Next month days to complete 42 grid cells
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false
            });
        }
        
        return days;
    };

    const handlePrevMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e: React.MouseEvent) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (date: Date) => {
        // Adjust for timezone offset to get perfect YYYY-MM-DD
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        onChange(adjustedDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        setIsOpen(false);
    };

    const handleToday = (e: React.MouseEvent) => {
        e.stopPropagation();
        const today = new Date();
        const offset = today.getTimezoneOffset();
        const adjustedToday = new Date(today.getTime() - (offset * 60 * 1000));
        onChange(adjustedToday.toISOString().split('T')[0]);
        setViewDate(today);
        setIsOpen(false);
    };

    const formatDateDisplay = (dateString: string) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '';
        return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    };

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const days = getDaysInMonth(currentYear, currentMonth);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const selectedStr = value ? new Date(value).toISOString().split('T')[0] : '';

    return (
        <div className="relative font-['Cairo']" ref={containerRef} dir="rtl">
            {/* Trigger Input */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-white border ${isOpen ? 'border-[#2596be] ring-2 ring-[#2596be]/20' : 'border-gray-300'} rounded-lg outline-none transition-all cursor-pointer flex justify-between items-center`}
            >
                <span className={value ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                    {value ? formatDateDisplay(value) : placeholder}
                </span>
                <CalendarIcon size={18} className={isOpen ? 'text-[#2596be]' : 'text-gray-400'} />
            </div>

            {/* Calendar Popover */}
            {isOpen && (
                <div className="absolute z-50 mt-1 p-2 bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 w-[240px] right-0">
                    
                    {/* Header & Navigation */}
                    <div className="flex justify-between items-center mb-2 px-1">
                        <h3 className="text-[1.1rem] font-bold text-gray-900">
                            {ARABIC_MONTHS[currentMonth]} {currentYear}
                        </h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleNextMonth} 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight size={20} />
                            </button>
                            <button 
                                onClick={handlePrevMonth} 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <ChevronLeft size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="mb-1">
                        {/* Days of week header */}
                        <div className="grid grid-cols-7 mb-1 border-b border-gray-100 pb-1">
                            {ARABIC_DAYS.map((day, idx) => (
                                <div key={idx} className="text-center text-[0.65rem] font-bold text-gray-400 uppercase">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Dates grid */}
                        <div className="grid grid-cols-7 gap-y-0 gap-x-0.5">
                            {days.map((dayObj, idx) => {
                                const offset = dayObj.date.getTimezoneOffset();
                                const adjustedDate = new Date(dayObj.date.getTime() - (offset * 60 * 1000));
                                const dateStr = adjustedDate.toISOString().split('T')[0];
                                
                                const isSelected = dateStr === selectedStr;
                                const isToday = dateStr === todayStr;

                                return (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.preventDefault(); handleDateSelect(dayObj.date); }}
                                        type="button"
                                        className={`
                                            h-6 w-full rounded-md flex items-center justify-center text-[0.75rem] font-semibold transition-all
                                            ${!dayObj.isCurrentMonth ? 'text-gray-300 hover:text-gray-500' : ''}
                                            ${isSelected 
                                                ? 'bg-[#2596be] text-white shadow-md' 
                                                : dayObj.isCurrentMonth 
                                                    ? 'text-gray-700 hover:bg-gray-100' 
                                                    : 'hover:bg-gray-50'
                                            }
                                            ${isToday && !isSelected ? 'text-[#2596be] font-bold bg-[#2596be]/5' : ''}
                                        `}
                                    >
                                        {dayObj.date.getDate()}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Action Bar */}
                    <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-1 px-1">
                        <button 
                            type="button"
                            onClick={handleClear}
                            className="text-[0.75rem] font-bold text-gray-500 hover:text-red-500 transition-colors px-1 py-1"
                        >
                            مسح
                        </button>
                        <button 
                            type="button"
                            onClick={handleToday}
                            className="text-[0.75rem] font-bold text-[#2596be] hover:text-[#1e7a9c] transition-colors px-1 py-1"
                        >
                            اليوم
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
