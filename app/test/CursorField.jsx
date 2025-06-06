import {
  headerStyle,
  sectionStyle
} from './Look.js';

export const CursorField = ({ hasNextCursor, onRequestNextCursor }) => {
  // Determine status display based on hasNextCursor
  let statusContent;
  
  if (hasNextCursor === undefined) {
    // Loading state when hasNextCursor is undefined
    statusContent = <div>LOADING</div>;
  } else if (hasNextCursor === false) {
    // No more pages when hasNextCursor is false
    statusContent = <div>ALL CURSORS LOADED</div>;
  } else {
    // Button to load next page when hasNextCursor is true
    statusContent = (
      <button 
        onClick={onRequestNextCursor}
        style={{
          padding: '4px 8px',
          cursor: 'pointer',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '3px'
        }}
      >
        LOAD NEXT CURSOR
      </button>
    );
  }

  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={headerStyle}>
        CURSOR STATUS
      </div>
      
      <div style={sectionStyle}>
        {statusContent}
      </div>
    </div>
  );
};