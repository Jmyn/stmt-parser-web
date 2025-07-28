"use client";

import React, { useContext } from "react";
import { ProfileContext } from "@/app/context/profile.context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  const { profile, setProfile, saveProfile } = useContext(ProfileContext);

  const handleDownload = () => {
    const dataStr = JSON.stringify(profile, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = "profile.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (_e) => {
        const content = _e.target?.result;
        if (typeof content === "string") {
          try {
            const newProfile = JSON.parse(content);
            saveProfile(newProfile)
            setProfile(newProfile);
            alert("Profile loaded successfully!");
          } catch {
            alert("Error parsing profile file.");
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile Management</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={handleDownload}>Download Profile</Button>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="profile-upload" className="sr-only">Upload Profile</label>
            <input id="profile-upload" type="file" accept=".json" onChange={handleUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
