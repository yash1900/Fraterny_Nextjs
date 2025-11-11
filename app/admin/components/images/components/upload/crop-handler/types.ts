
import { RefObject } from 'react';
import { type Crop as CropArea } from 'react-image-crop';

export interface ImageCropHandlerProps {
  imageSrc: string;
  uploadFile: File;
  onCroppedFile: (file: File) => void;
  imageKey: string;
}

export interface CropControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  onApplyChanges: () => void;
  onCancel: () => void;
}

export interface CropPreviewProps {
  imgRef: RefObject<HTMLImageElement | null>;
  completedCrop: CropArea | null;
  uploadFile: File;
}


