export const linkStyle = {
  color: 'blue',
  textDecoration: 'underline',
  cursor: 'pointer'
};

export const headerStyle = {
  fontSize: '20px',
  fontWeight: 'bold',
  cursor: 'pointer'
};

export const sectionStyle = {
  border: '1px dashed gray',
  margin: '10px',
  padding: '10px'
};
  
export const getTextAreaStyle = error => {
  return {
    border: `1px solid black`,
    padding: '10px',
    margin: '10px',
    backgroundColor: error ? '#FFCCCB' : '#fff',
    color: '#000'
  };
};