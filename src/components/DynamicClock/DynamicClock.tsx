import React, { useState, useEffect } from 'react';

function DynamicClock() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, []); 
  return (
    <div>
      {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
  );
}

export default DynamicClock;
