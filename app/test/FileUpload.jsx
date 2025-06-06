import {
  uniqueId
} from 'lodash-es';
import {
  useRef,
  useState
} from 'react';

// Style for the file drop area
const fileDropAreaStyle = {
  border: '2px dashed #aaa',
  borderRadius: '4px',
  padding: '10px',
  marginTop: '10px',
  backgroundColor: '#f8f8f8',
  textAlign: 'center',
  cursor: 'pointer'
};

// Style for the file list
const fileListStyle = {
  marginTop: '10px',
  fontSize: '0.9em'
};

// Style for individual file items
const fileItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '3px 0'
};


export const FileUpload = ({ files, setFiles }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  // Handle drop event
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };
  
  // Handle file input change
  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };
  
  // Process files
  const handleFiles = (fileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      file,
      uid: uniqueId('file_'),
      name: file.name
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  };
  
  // Remove a file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  // Open file dialog
  const openFileDialog = () => {
    fileInputRef.current.click();
  };

  return (
    <>
      {/* File upload area */}
      <div 
        style={{ 
          ...fileDropAreaStyle, 
          borderColor: dragActive ? '#2196f3' : '#aaa',
          backgroundColor: dragActive ? '#e6f7ff' : '#f8f8f8'
        }}
        onClick={openFileDialog}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <p>Drag files here or click to upload</p>
        <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
          Add files to upload and use the UIDs in your JSON
        </p>
        <input 
          ref={fileInputRef}
          type="file" 
          multiple
          onChange={handleChange}
          style={{ display: "none" }}
        />
      </div>
      
      {/* File list */}
      {files.length > 0 && (
        <div style={fileListStyle}>
          <p><strong>Files to upload (with UIDs):</strong></p>
          {files.map((file, index) => (
            <div key={file.uid} style={fileItemStyle}>
              <div>
                <span style={{ fontWeight: 'bold' }}>{file.uid}</span>: {file.name}
              </div>
              <button onClick={() => removeFile(index)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
};
