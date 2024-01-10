// FileUploadComponent.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './styles.css';

type Props = {
    onSubmit: (file: File) => void
  }

const UploadFile = ({ onSubmit }: Props) => {
    
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (file) {
            onSubmit(file)
        }
    }, [onSubmit]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

    return (
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
            <input {...getInputProps()} />
            {
                isDragActive ?
                <p>Drop the files here ...</p> :
                <p>Drag 'n' drop some files here, or click to select files</p>
            }
        </div>
    );
};

export default UploadFile;
