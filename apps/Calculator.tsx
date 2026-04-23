import React, { useState, useCallback } from 'react';

const CalculatorApp = () => {
  const [display, setDisplay] = useState('0');
  const [isDone, setIsDone] = useState(false);

  const handlePress = useCallback((val: string) => {
    if (isDone && !isNaN(Number(val))) {
      setDisplay(val);
      setIsDone(false);
      return;
    }

    if (val === 'C') {
      setDisplay('0');
      setIsDone(false);
    } else if (val === '=') {
      try {
        const result = new Function('return ' + display.replace(/x/g, '*').replace(/÷/g, '/'))();
        setDisplay(String(result));
        setIsDone(true);
      } catch (e) {
        setDisplay('Error');
      }
    } else {
      if (display === '0' || display === 'Error' || isDone) {
        setDisplay(val);
        setIsDone(false);
      } else {
        setDisplay(display + val);
      }
    }
  }, [display, isDone]);

  const buttons = [
    'C', '(', ')', '÷',
    '7', '8', '9', 'x',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white p-2">
      <div className="flex-1 bg-slate-800 rounded mb-2 flex items-end justify-end p-4 text-3xl font-mono truncate border border-slate-700">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-2 h-4/5">
        {buttons.map((btn, i) => (
          <button
            key={i}
            onClick={() => handlePress(btn)}
            className={`rounded font-bold text-lg hover:bg-opacity-80 active:scale-95 transition-all
              ${btn === '=' ? 'col-span-2 bg-blue-600' : 
                ['C', '(', ')', '÷', 'x', '-', '+'].includes(btn) ? 'bg-slate-700 text-blue-300' : 'bg-slate-800'}
            `}
            aria-label={`Button ${btn}`}
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CalculatorApp;
