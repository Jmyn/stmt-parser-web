"use client";

import { Button } from "@/components/ui/button";
import { MinusIcon } from "lucide-react";
import { useContext } from "react";
import { ProfileContext } from "@/app/context/profile.context";
import { CategorisationRule } from "../types";
import { processRule } from "./rule.util";
import { toast } from "@/hooks/use-toast";

interface DeleteRuleButtonProps {
  rule: CategorisationRule;
}

export function DeleteRuleButton({ rule }: DeleteRuleButtonProps) {
  const { profile, setProfile, saveProfile } = useContext(ProfileContext);

  const handleDelete = () => {
    const updatedRules = profile.categorisationRules.filter(
      (r) => r.id !== rule.id
    );

    for (const trx of profile.transactions) {
      trx.category = undefined;
      for(const rule of updatedRules) {
        const isCategory = processRule(trx, rule);
        if (isCategory) {
          trx.category = rule.category;
        }
      }
    }
    const newProfile = {
      ...profile,
      categorisationRules: updatedRules,
      transactions: [...profile.transactions],
    };
    setProfile(newProfile);
    saveProfile(newProfile);
    toast({
      title: "Rule Deleted",
    });
  };

  return (
    <Button onClick={handleDelete}>
      <MinusIcon />
    </Button>
  );
}
