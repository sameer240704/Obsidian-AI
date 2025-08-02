"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BiUpload } from "react-icons/bi";
import { ImImage } from "react-icons/im";

const placeholderImages = [
  "https://i.pinimg.com/736x/47/87/9c/47879cf1d71c4d0d358cf7c7ece60296.jpg",
  "https://i.pinimg.com/736x/48/30/8c/48308cd29d7103e59031e92350638ecd.jpg",
  "https://i.pinimg.com/1200x/4e/9f/09/4e9f097f3bbfd2178ed3076adda7fed5.jpg",
  "https://i.pinimg.com/736x/73/dc/fd/73dcfde212fdc13849eec3bd55efd1a8.jpg",
  "https://i.pinimg.com/736x/d5/cb/a2/d5cba23e858788e44717b1e30a5e7e32.jpg",
  "https://i.pinimg.com/736x/46/5b/7b/465b7b1c6c12105cec9bb386f6eafff2.jpg",
  "https://i.pinimg.com/736x/7c/91/98/7c91983bba1e8fc8e63fe3c3ca4e4880.jpg",
];

export function ImageUploadSection() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedPlaceholder, setSelectedPlaceholder] = useState<number | null>(
    null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setSelectedPlaceholder(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceholderSelect = (index: number) => {
    setSelectedPlaceholder(index);
    setPreviewImage(null);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="botImage" className="mb-2 text-lg font-medium">
        AI Assistant Avatar
      </Label>

      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-fit bg-transparent border-none shadow-none px-2">
          <CardContent className="flex flex-col items-center px-2">
            <div className="relative w-28 h-28 rounded-xl overflow-hidden shadow-lg">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="AI Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : selectedPlaceholder !== null ? (
                <img
                  src={placeholderImages[selectedPlaceholder]}
                  alt="Placeholder Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <ImImage className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="w-full md:w-2/3 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={triggerFileInput}
                className="flex items-center gap-2"
              >
                <BiUpload className="h-4 w-4" />
                Choose File
              </Button>
              <Input
                id="botImage"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {previewImage ? "Image selected" : "No file chosen"}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Upload a square image (recommended 512×512px)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Or select a placeholder</Label>
            <div className="flex flex-wrap gap-3">
              {placeholderImages.map((img, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handlePlaceholderSelect(index)}
                  className={`relative w-12 h-12 rounded-full overflow-hidden border transition-all cursor-pointer ${
                    selectedPlaceholder === index
                      ? "border-primary-500 ring-2 ring-primary-300"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Placeholder ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
