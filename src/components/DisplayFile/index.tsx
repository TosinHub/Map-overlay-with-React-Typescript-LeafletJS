import React, { useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

interface PdfToImageProps {
    file: File;
    onImageReady: (imageUrl: string) => void;
}

const PdfToImage: React.FC<PdfToImageProps> = ({ file, onImageReady }) => {
    useEffect(() => {
        const fileReader = new FileReader();

        fileReader.onload = async (event) => {
            try {
							// @ts-ignore
                const typedArray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdfDocument = await pdfjsLib.getDocument(typedArray).promise;
                const page = await pdfDocument.getPage(1); // Assuming you want the first page

                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const canvasContext = canvas.getContext('2d');
                const renderContext = {
                    canvasContext,
                    viewport,
                };

							// @ts-ignore
                await page.render(renderContext).promise;
                const imageUrl = canvas.toDataURL('image/png');
                onImageReady(imageUrl);
            } catch (error) {
                console.error('Error converting PDF to image:', error);
            }
        };

        fileReader.readAsArrayBuffer(file);
    }, [file, onImageReady]);

    return null; // This component does not render anything
};

export default PdfToImage;
