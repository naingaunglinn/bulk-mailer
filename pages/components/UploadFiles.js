'use client';

import { storage } from "@/lib/appwrite";
import { ID } from "appwrite";
import { useState } from "react";

// Upload a file to Appwrite storage
const uploadFile = async (file) => {
    if (!file) {
        console.error("No file selected");
        return;
    }

    try {
        const response = await storage.createFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
            ID.unique(),
            file
        );
        
        return response.$id;
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};

// Delete a file by ID
const deleteFile = async (fileId) => {
    try {
        await storage.deleteFile(
            process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
            fileId
        );
        console.log('File deleted successfully.');
    } catch (error) {
        console.error('Error deleting file:', error);
    }
};

// Get file preview URL
const getFilePreview = (fileId) => {
    return storage.getFilePreview(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
        fileId
    );
};

const UploadFiles = () => {
    const [fileId, setFileId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

      const [selectedFile, setSelectedFile] = useState(null);
      const [fileName, setFileName] = useState('No file chosen');


      const handleFileChange = (e) => {
        if (e.target.files?.length) {
          setSelectedFile(e.target.files[0]);
          setFileName(e.target.files[0].name);
        } else {
          setFileName('No file chosen');
        }
      };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const file = e.target.fileInput.files[0];
        if (!file) {
            alert("Please select a file first.");
            return;
        }

        const uploadedFileId = await uploadFile(file);
        if (uploadedFileId) {
            setFileId(uploadedFileId);
            setFileName(file.name);
            setTimeout(() => {
                window.location.reload();
            }, 5000);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 border rounded-sm shadow">
            <label className="block my-2 text-2xl fong-bold font-medium text-white">
                Upload Resume
            </label>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex items-center rounded-md mb-2 overflow-hidden bg-[#2e384d] text-gray-300 cursor-pointer">
                  <span className="bg-[#3a445c] px-4 py-2 text-md font-semibold">Choose File</span>
                  <span className="px-4 py-2 text-md truncate">{fileName}</span>
                  <input
                    type="file"
                    name="fileInput"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                <button
                    type="submit"
                    className="text-gray-900 
                        hover:text-white 
                          border 
                          border-white
                          hover:bg-white
                          focus:outline-none 
                          focus:ring-white
                          font-medium 
                          rounded-lg 
                          text-sm 
                          px-5 
                          py-2.5 
                          text-center 
                          me-2 
                          mb-2 
                          dark:border-white 
                          dark:text-white 
                          dark:hover:text-gray-700 
                          dark:hover:bg-white"
                >
                    Upload PDF
                </button>
            </form>

            {fileId && (
              <div className="mt-4 space-y-2">
                <p className="text-gray-500 font-semibold">Uploaded File: <span className="text-amber-500">{fileName}</span></p>
              </div>
            )}
        </div>
    );
};

export default UploadFiles;
