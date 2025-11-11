
import { Crop as CropArea } from 'react-image-crop';

/**
 * Creates a cropped image from the original image
 */
export const createCroppedImage = async (
  fileName: string,
  fileType: string,
  image: HTMLImageElement,
  crop: CropArea,
  zoom: number,
  rotation: number
): Promise<File | null> => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('No 2d context');
    return null;
  }
  
  // Calculate scaling factors
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  
  // Set canvas dimensions to the cropped area
  const pixelCrop = {
    x: crop.x * scaleX,
    y: crop.y * scaleY,
    width: crop.width * scaleX,
    height: crop.height * scaleY,
  };
  
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  // Apply zoom and rotation if needed
  ctx.save();
  
  // Start with the canvas context at the center of the output
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Apply rotation in radians
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180);
  }
  
  // Apply zoom
  if (zoom !== 1) {
    ctx.scale(zoom, zoom);
  }
  
  // Move back to draw the image centered
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  ctx.restore();
  
  // Convert to a Blob and then to a File
  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas to Blob conversion failed');
        resolve(null);
        return;
      }
      
      const file = new File([blob], fileName, {
        type: fileType,
        lastModified: Date.now(),
      });
      
      resolve(file);
    }, fileType, 1);
  });
};


