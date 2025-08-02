"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploadSection } from "@/components/details-form/image-upload-section";
import { BackgroundGradientAnimation } from "@/components/ui/background-gradient-animation";
import { FlipWords } from "@/components/ui/flip-words";
import Image from "next/image";
import { Logo } from "@/public/images";

const DetailForm = () => {
  const [formData, setFormData] = useState({
    obsidianPath: "",
    groqApiKey: "",
    aiName: "",
    aiDescription: "",
    botImage: "",
  });

  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log(formData);
    // router.push('/dashboard');
  };

  const words: string[] = [
    "AI",
    "Memory",
    "Context",
    "Insight",
    "Vision",
    "Intelligence",
  ];

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="h-screen hidden lg:block w-2/5 bg-transparent rounded-r-4xl overflow-hidden">
        <div className="absolute bg-white/20 backdrop-blur-2xl z-10 flex justify-center items-center p-0.5 rounded-md left-5 top-10">
          <Image src={Logo} alt="Logo" className="h-10 w-auto" />
        </div>
        <BackgroundGradientAnimation>
          <div className="absolute bottom-10 left-1 flex justify-center items-center px-4 z-10">
            <div className="text-4xl mx-auto font-medium text-neutral-200 dark:text-neutral-200">
              Reimagine your obsidian with
              <FlipWords words={words} /> <br />
              Connect insights. Build clarity effortlessly.
            </div>
          </div>
        </BackgroundGradientAnimation>
      </div>

      <div className="h-full w-full lg:w-3/5 p-8 lg:p-12 flex flex-col justify-start overflow-auto">
        <div className="w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Welcome to{" "}
              <span className="italic text-primary-600 dark:text-primary-300 font-playfair font-bold">
                obsidian.ai
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Configure your personal AI assistant powered by your Obsidian
              knowledge base.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="bg-transparent border-none shadow-none p-0">
              <CardContent className="space-y-6 bg-transparent px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="obsidianPath"
                      className="mb-2 flex items-center gap-1"
                    >
                      Obsidian Vault Path
                    </Label>
                    <Input
                      id="obsidianPath"
                      name="obsidianPath"
                      type="text"
                      value={formData.obsidianPath}
                      onChange={handleChange}
                      placeholder="~/Documents/Obsidian-Vault"
                      className="h-10"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Path to your Obsidian vault directory
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="groqApiKey"
                      className="mb-2 flex items-center gap-1"
                    >
                      Groq API Key
                    </Label>
                    <Input
                      id="groqApiKey"
                      name="groqApiKey"
                      type="password"
                      value={formData.groqApiKey}
                      onChange={handleChange}
                      placeholder="sk_xxxxxxxxxxxxxxxx"
                      className="h-10"
                    />
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Your API key is encrypted and stored securely
                    </p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="aiName" className="mb-2">
                    AI Assistant Name
                  </Label>
                  <Input
                    id="aiName"
                    name="aiName"
                    type="text"
                    value={formData.aiName}
                    onChange={handleChange}
                    placeholder="e.g. Aakhri Paasta"
                    className="h-10"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Give your AI assistant a unique name
                  </p>
                </div>

                <ImageUploadSection />

                <div>
                  <Label htmlFor="aiDescription" className="mb-2">
                    AI Assistant Personality Description
                  </Label>
                  <Textarea
                    id="aiDescription"
                    name="aiDescription"
                    value={formData.aiDescription}
                    onChange={handleChange}
                    placeholder="Describe how your AI should behave and respond..."
                    className="min-h-20"
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Example: "A helpful assistant that answers in Markdown
                    format with a scholarly tone"
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end mt-4">
              <Button
                type="submit"
                className="font-semibold px-8 dark:text-neutral-100 bg-primary-500 hover:bg-primary-600 cursor-pointer"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DetailForm;
