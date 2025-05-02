'use client';

import { useState } from 'react';

export default function UploadForm() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [response, setResponse] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');


  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    } else {
      setFileName('No file chosen');
    }
  };
  
  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      alert('Please upload an Excel file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    setUploading(true);
    try {
      const res = await fetch('/api/send-emails', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResponse(data);

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error('Upload failed:', error);
      setResponse({ error: 'Something went wrong.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-4 border rounded shadow bg-white">
      <form onSubmit={handleUpload}>
        <label className="block my-2 text-2xl fong-bold font-medium text-black">
          Upload Mail Data Sheet
        </label>
        <label className="flex items-center rounded-md mb-2 overflow-hidden bg-[#2e384d] text-gray-300 cursor-pointer">
          <span className="bg-[#3a445c] px-4 py-2 text-md font-semibold">Choose File</span>
          <span className="px-4 py-2 text-md truncate">{fileName}</span>
          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        

        <button type="submit" 
                disabled={uploading} 
                className={`text-gray-900 
                        hover:text-white 
                          border 
                          border-gray-800 
                          hover:bg-gray-950
                          focus:outline-none 
                          focus:ring-gray-300 
                          font-medium 
                          rounded-lg 
                          text-sm 
                          px-5 
                          py-2.5 
                          text-center 
                          me-2 
                          mb-2 
                          dark:border-gray-600 
                          dark:text-black 
                          dark:hover:text-white 
                          dark:hover:bg-gray-950`}> 
                {uploading ? (
                  <>
                  <svg aria-hidden="true" role="status" className="inline w-4 h-4 me-3 text-gray-200 animate-spin dark:text-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="#000000"/>
                  </svg> Sending...
                  </>
                 ): ('Send Emails')}
        </button>
      </form>

      {response &&
        <div className="mt-4 text-sm text-gray-950 font-bold">
          <pre>Your mails are successfully sent.</pre>
        </div>}
    </div>
  );
}
