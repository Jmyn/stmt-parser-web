"use client";

import React, { useContext } from "react";
import { ruleColumns } from "./columns";
import { RuleTable } from "./rule.data-table";
import { ProfileContext } from "@/app/context/profile.context";

export default function RulesPage() {
  const { profile } = useContext(ProfileContext);
  return <RuleTable columns={ruleColumns} data={profile.categorisationRules} />;
}
