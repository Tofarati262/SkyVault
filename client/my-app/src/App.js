import './App.css';
import React, { useEffect, useRef, useState } from 'react';

function App() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);
  const megabyte = 1024 * 1024;

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
    const maxSize = 50 * megabyte;

    if (selectedFile.size > maxSize) {
      setMessage("File is too large");
      setFile(null); // Reset file if it is too large
    } else {
      setMessage(`File selected: ${selectedFile.name}`);
      setFile(selectedFile); // Store the selected file
    }
  };

  useEffect(() => {
    console.log(file);
  }, [file]);

  const handlesongupload = async (event) => {
    event.preventDefault(); // Prevent default form submission behavior

    if (!file) {
      alert("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);

    try {
      const response = await fetch("http://localhost:5000/uploads", {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage("File uploaded successfully!");
        console.log("Response:", await response.json());
      } else {
        setMessage("File upload failed.");
        console.error("Upload failed:", response);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("An error occurred while uploading the file.");
    }
  };

  return (
    <form onSubmit={handlesongupload}>
      <div className="App" onClick={handleClick}>
        <input
          type="file"
          id="fileuploads"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }} // Hide the input element
        />
        <div className="upload-placeholder">
          {message || "Click to select a file"}
        </div>
      </div>
      {file && (
        <button type="submit">Upload File</button>
      )}
    </form>
  );
}

export default App;
