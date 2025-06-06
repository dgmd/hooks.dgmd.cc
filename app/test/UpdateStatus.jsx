import {
  headerStyle,
  sectionStyle
} from './Look.js';

export const UpdateStatus = ({ title, status }) => {
  // Check if status is an array
  const isStatusArray = Array.isArray(status);
  
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={headerStyle}>
        { title }
      </div>
      
      {isStatusArray ? (
        <div style={{
          ...sectionStyle,
          maxHeight: '150px',
          height: '150px',
          overflowY: 'auto',
          backgroundColor: '#f8f8f8'
        }}>
          <ul style={{ 
            listStyle: 'none', 
            padding: '0',
            margin: '0'
          }}>
            {status.map((item, idx) => (
              <li key={idx} style={{
                padding: '5px',
                borderBottom: idx < status.length - 1 ? '1px solid #eee' : 'none',
                fontSize: '14px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                <span style={{ fontWeight: 'bold', marginRight: '10px' }}>{item.time}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.status}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={sectionStyle}>
          { status }
        </div>
      )}
    </div>
  );
};