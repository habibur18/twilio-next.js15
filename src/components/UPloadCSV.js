"use client";
import { useState } from "react";

const UploadCSV = ({ id }) => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file.");
      return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch(`/api/stage/${id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("File uploaded and processed successfully!");
      } else {
        setMessage(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error uploading CSV:", error);
      setMessage("Error uploading the file.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3>Upload CSV to New Leads</h3>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Uploading..." : "Upload CSV"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default UploadCSV;
