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

export const getTextAreaStyle = (valid, updating=false) => {
  return {
    borderWidth: `2px`,
    borderStyle: updating ? `dashed` : `solid`,
    borderColor: valid ? '#000' : "#f00",
    outlineColor: valid ? '#000' : '#f00',
    padding: '10px',
    margin: '10px',
    color: '#000'
  };
};