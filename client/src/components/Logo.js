import React from 'react';

const Logo = ({ size = 'md', withText = true }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  return (
    <div className="flex items-center">
      <div className={`${sizes[size]}`}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" className="w-full h-full">
          <g>
            {/* Robot head and body */}
            <path className="fill-current text-gray-900" d="M261.5 139.5c13.3 0 24-10.7 24-24s-10.7-24-24-24-24 10.7-24 24 10.7 24 24 24z"/>
            <path className="fill-current text-gray-900" d="M365.5 463c-15.6-15.1-24.7-35.8-25.5-57.6v-146.8c0-54.3-44.1-98.4-98.5-98.4h-72c-54.3 0-98.5 44.1-98.5 98.4v146.7c-.8 21.8-9.9 42.5-25.5 57.6-1.9 1.8-2.9 4.4-2.9 7s1.1 5.2 2.9 7c2.1 2 4.7 2.9 7.3 2.9 2.4 0 4.8-.8 6.8-2.4 21.4-19.5 33.6-46.8 34.8-74.9v-143.9c0-41.7 33.9-75.6 75.6-75.6h71.5c41.7 0 75.6 33.9 75.6 75.6v143.9c1.2 28.1 13.4 55.4 34.8 74.9 2 1.6 4.4 2.4 6.8 2.4 2.6 0 5.3-.9 7.3-2.9 1.9-1.8 2.9-4.4 2.9-7s-1-5.2-2.9-7z"/>
            
            {/* Robot eyes */}
            <circle className="fill-current text-gray-900" cx="225.5" cy="269.5" r="24"/>
            <circle className="fill-current text-gray-900" cx="325.5" cy="269.5" r="24"/>
          </g>
        </svg>
      </div>
      
      {withText && (
        <span className="ml-2 text-2xl font-bold text-gray-900">ChatBot</span>
      )}
    </div>
  );
};

export default Logo; 