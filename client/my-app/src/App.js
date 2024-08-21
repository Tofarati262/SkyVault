import './App.css';
import React, { useEffect, useRef, useState } from 'react';

function App() {
  const fileInputRef = useRef(null);
  const formRef = useRef(null); // Create a ref for the form
  const [file, setFile] = useState(null);

  useEffect(() => {
    document.title = "React Uploader"; // Set the title here
  }, []);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click(); // Trigger file input click
    }
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      formRef.current.submit(); // Submit the form programmatically
    }
  };

  const handlesongupload = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior
    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Replace with your upload logic (e.g., sending formData to your server)
      const response = await fetch('YOUR_UPLOAD_ENDPOINT', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert("File uploaded successfully!");
      } else {
        alert("File upload failed.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("An error occurred while uploading the file.");
    }
  };

  return (
    <form ref={formRef} onSubmit={handlesongupload}>
      <div className="App" onClick={handleClick}>
        <input
          type="file"
          id="fileuploads"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the input element
        />
        <div className="upload-placeholder" >
          Click to select a file
        </div>
      </div>
    </form>
  );
}

export default App;
