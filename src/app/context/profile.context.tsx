"use client";

import React from "react";
import { TransactionsProfile } from "../transactions/types";

const LOCAL_STORAGE_PROFILE_KEY = "profile";

type ProfileProviderProps = {
  children: React.ReactNode;
};

export const ProfileContext = React.createContext<{
  profile: TransactionsProfile;
  setProfile: React.Dispatch<React.SetStateAction<TransactionsProfile>>;
  saveProfile: (profile: TransactionsProfile) => void;
}>({
  profile: {
    transactions: [],
    transactionMap: {},
    categories: [],
    categorisationRules: [],
  },
  setProfile: () => {},
  saveProfile: () => {},
});

const defaultProfile: TransactionsProfile = {
  transactions: [],
  transactionMap: {},
  categories: [],
  categorisationRules: [],
};

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const [profile, setProfile] = React.useState(defaultProfile);
  const [isLoading, setIsLoading] = React.useState(true);
  const saveProfile = (profile: TransactionsProfile) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(profile));
    }
  };
  let loadedProfile = defaultProfile;
  if (typeof window !== "undefined") {
    const loadedProfileStr =
      localStorage.getItem(LOCAL_STORAGE_PROFILE_KEY) ?? "";
    loadedProfile = loadedProfileStr
      ? (JSON.parse(loadedProfileStr) as TransactionsProfile)
      : defaultProfile;
  }

  React.useEffect(() => {
    void (async () => {
      try {
        setProfile(loadedProfile);
      } catch {
        setProfile(loadedProfile);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, saveProfile }}>
      {isLoading ? null : children}
    </ProfileContext.Provider>
  );
};
