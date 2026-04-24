import React from 'react';

const ELDLog = ({ dayEvents, date }) => {
  const width = 800;
  const height = 200;
  const margin = { top: 30, right: 20, bottom: 20, left: 60 };
  
  const statuses = [
    { id: 1, label: 'OFF' },
    { id: 2, label: 'SB' },
    { id: 3, label: 'D' },
    { id: 4, label: 'ON' }
  ];
  
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const statusHeight = innerHeight / 4;
  const hourWidth = innerWidth / 24;
  
  const getX = (hour) => margin.left + hour * hourWidth;
  const getY = (status) => {
    const index = statuses.findIndex(s => s.id === status);
    return margin.top + (index + 0.5) * statusHeight;
  };

  // Generate polyline points
  let points = "";
  let lastX = getX(0);
  let lastY = getY(dayEvents[0]?.status || 1);
  points += `${lastX},${lastY} `;

  dayEvents.forEach((event, i) => {
    const startX = getX(event.start_hour);
    const endX = getX(event.start_hour + event.duration);
    const currentY = getY(event.status);
    
    // Horizontal line
    points += `${startX},${currentY} ${endX},${currentY} `;
  });

  return (
    <div className="eld-log-container">
      <h3>Log for {date}</h3>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Background Grid */}
        <rect x={margin.left} y={margin.top} width={innerWidth} height={innerHeight} fill="#1a1a1a" stroke="#333" />
        
        {/* Status Rows */}
        {statuses.map((status, i) => (
          <React.Fragment key={status.id}>
            <line 
              x1={margin.left} 
              y1={margin.top + (i + 1) * statusHeight} 
              x2={width - margin.right} 
              y2={margin.top + (i + 1) * statusHeight} 
              stroke="#333" 
            />
            <text x={margin.left - 10} y={margin.top + (i + 0.6) * statusHeight} fill="#aaa" fontSize="12" textAnchor="end">
              {status.label}
            </text>
          </React.Fragment>
        ))}
        
        {/* Hour Columns */}
        {[...Array(25)].map((_, i) => (
          <React.Fragment key={i}>
            <line 
              x1={getX(i)} 
              y1={margin.top} 
              x2={getX(i)} 
              y2={margin.top + innerHeight} 
              stroke="#333" 
              strokeDasharray={i % 6 === 0 ? "0" : "2,2"}
            />
            {i % 2 === 0 && (
              <text x={getX(i)} y={margin.top - 10} fill="#666" fontSize="10" textAnchor="middle">
                {i === 0 ? '12' : i > 12 ? i - 12 : i}
              </text>
            )}
          </React.Fragment>
        ))}

        {/* The Path */}
        <polyline
          points={points}
          fill="none"
          stroke="#00f2ff"
          strokeWidth="3"
          strokeLinejoin="round"
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 4px #00f2ff)' }}
        />
      </svg>
      
      <div className="event-list">
        {dayEvents.map((event, i) => (
          <div key={i} className="event-item">
            <span className="event-time">{event.start_time}</span>
            <span className={`event-status status-${event.status}`}>
              {statuses.find(s => s.id === event.status).label}
            </span>
            <span className="event-duration">{event.duration.toFixed(2)}h</span>
            <span className="event-label">{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ELDLog;
