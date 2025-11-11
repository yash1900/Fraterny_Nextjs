
import { Crop as CropArea } from 'react-image-crop';
import { RefObject } from 'react';

export interface ImageCropperProps {
  imageSrc: string;
  crop: CropArea;
  setCrop: (crop: CropArea) => void;
  setCompletedCrop: (crop: CropArea | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
  imgRef: RefObject<HTMLImageElement | null>;
  onApplyChanges: () => void;
  onCancelCrop: () => void;
  imageKey: string;
}

export interface ZoomRotateControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  rotation: number;
  setRotation: (rotation: number) => void;
}

export interface AspectRatioOption {
  value: number | undefined;
  label: string;
}


