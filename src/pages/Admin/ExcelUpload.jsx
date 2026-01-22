
import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import Button from '../../components/Button';

const ExcelUpload = () => {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (file.type.includes('sheet') || file.type.includes('excel') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')) {
            setFile(file);
            setUploadStatus('idle');
        } else {
            alert("Please upload a valid Excel or CSV file.");
        }
    };

    const handleUpload = () => {
        if (!file) return;
        setUploadStatus('uploading');

        // Simulate API call
        setTimeout(() => {
            // Random success/fail for demo
            if (Math.random() > 0.1) {
                setUploadStatus('success');
            } else {
                setUploadStatus('error');
            }
        }, 1500);
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Product Upload</h1>
            <p className="text-gray-500 mb-8">Upload your product inventory via Excel template.</p>

            <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleChange}
                    accept=".xlsx, .xls, .csv"
                />

                {!file ? (
                    <div className="flex flex-col items-center">
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-700">Drag & Drop Excel file here</p>
                        <p className="text-sm text-gray-500 mt-2">or click to browse</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <FileSpreadsheet className="w-12 h-12 text-green-600 mb-4" />
                        <p className="text-lg font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                        <button
                            onClick={(e) => { e.preventDefault(); setFile(null); setUploadStatus('idle'); }}
                            className="text-red-500 text-sm mt-4 hover:underline z-10 relative"
                        >
                            Remove File
                        </button>
                    </div>
                )}
            </div>

            {uploadStatus === 'idle' && file && (
                <Button className="w-full mt-6" size="lg" onClick={handleUpload}>
                    Upload Process
                </Button>
            )}

            {uploadStatus === 'uploading' && (
                <div className="mt-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Processing file...</p>
                </div>
            )}

            {uploadStatus === 'success' && (
                <div className="mt-8 p-4 bg-green-50 rounded-xl flex items-center text-green-700">
                    <CheckCircle className="w-6 h-6 mr-3" />
                    <div>
                        <p className="font-bold">Upload Successful!</p>
                        <p className="text-sm">50 products have been added to the inventory.</p>
                    </div>
                </div>
            )}

            {uploadStatus === 'error' && (
                <div className="mt-8 p-4 bg-red-50 rounded-xl flex items-center text-red-700">
                    <XCircle className="w-6 h-6 mr-3" />
                    <div>
                        <p className="font-bold">Upload Failed</p>
                        <p className="text-sm">There was an error processing your file. Please check format.</p>
                    </div>
                </div>
            )}

            <div className="mt-12 border-t border-gray-100 pt-8">
                <h3 className="font-bold text-gray-900 mb-4">Template Download</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center">
                        <FileSpreadsheet className="w-5 h-5 text-gray-500 mr-3" />
                        <span className="text-gray-700 font-medium">product_template_v1.xlsx</span>
                    </div>
                    <Button variant="outline" size="sm">Download</Button>
                </div>
            </div>
        </div>
    );
};

export default ExcelUpload;
