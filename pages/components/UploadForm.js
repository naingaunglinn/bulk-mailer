'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please upload an Excel file.');
      return;
    }
    console.log("working 1");

    const formData = new FormData();
    formData.append('file', selectedFile);

    console.log("working 2");
    setUploading(true);
    try {
      const res = await fetch('/api/send-emails', {
        method: 'POST',
        body: formData,
      });
      console.log("working 3");

      const data = await res.json();
      console.log(data);
      setResponse(data);
    } catch (error) {
      console.error('Upload failed:', error);
      setResponse({ error: 'Something went wrong.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow">
      <form onSubmit={handleUpload}>
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Upload Excel File (.xlsx)
        </label>
        <input
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="mb-4 block w-full"
        />

        <button
          type="submit"
          disabled={uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {uploading ? 'Uploading...' : 'Upload & Send Emails'}
        </button>
      </form>

      {response && (
        <div className="mt-4 text-sm text-gray-800">
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
