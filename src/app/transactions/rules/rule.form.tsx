"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  categorisationRuleSchema,
  operationSelections,
  targetFieldSelections,
} from "./rule.schema";

import { ProfileContext } from "@/app/context/profile.context";
import { Combobox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { SheetClose } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useContext } from "react";
import { CategorisationRule } from "../types";
import { RuleCombobox } from "./rule.combobox";
import { processRule } from "./rule.util";
import { useToast } from "@/hooks/use-toast";

export function RuleForm() {
  // 1. Define your form.
  const form = useForm<z.infer<typeof categorisationRuleSchema>>({
    resolver: zodResolver(categorisationRuleSchema),
    defaultValues: {
      id: 0,
      category: "",
      operations: [],
    },
  });
  const { profile, setProfile, saveProfile } = useContext(ProfileContext);
  const { toast } = useToast();

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof categorisationRuleSchema>) {
    const { category, operations } = values;
    const rule: CategorisationRule = {
      id: profile.categorisationRules.length,
      operations,
      category,
    };
    let affectedCnt = 0;

    for (const trx of profile.transactions) {
      const isCategory = processRule(trx, rule);

      if (isCategory) {
        affectedCnt++;
        trx.category = rule.category;
      }
    }
    const categorisationRules = [...profile.categorisationRules];
    categorisationRules.push(rule);
    const newProfile = {
      ...profile,
      categorisationRules,
      transactions: [...profile.transactions],
    };
    setProfile(newProfile);
    saveProfile(newProfile);
    toast({
      title: "Rule Added",
      description: `${affectedCnt} transactions affected`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <RuleCombobox field={field} />
              </FormControl>
              <FormDescription>
                All transactions that match rule will be mapped to this category
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Operations Array Field */}
        <FormItem>
          <FormLabel>Operations</FormLabel>
          <FormDescription>
            Define rule operations to determine the category.
          </FormDescription>
          {form.getValues("operations").map((operation, index) => (
            <div
              key={operation.id}
              className="flex flex-col items-start space-x-4 space-y-4"
            >
              <FormLabel>{operation.id}</FormLabel>
              <FormField
                control={form.control}
                name={`operations.${index}.targetField`}
                render={({ field }) => (
                  <FormControl>
                    <Combobox
                      field={field}
                      selections={targetFieldSelections}
                    />
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name={`operations.${index}.op`}
                render={({ field }) => (
                  <FormControl>
                    <Combobox field={field} selections={operationSelections} />
                  </FormControl>
                )}
              />
              <FormField
                control={form.control}
                name={`operations.${index}.value`}
                render={({ field }) => (
                  <FormControl>
                    <Textarea {...field} placeholder="Value" />
                  </FormControl>
                )}
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  const operations = form.getValues("operations");
                  form.setValue(
                    "operations",
                    operations
                      .slice(0, index)
                      .concat(operations.slice(index + 1))
                  );
                  form.trigger();
                }}
              >
                Remove
              </Button>
              <Separator />
            </div>
          ))}
          <Button
            type="button"
            onClick={() => {
              const operations = form.getValues("operations");
              operations.push({
                id: operations.length,
                value: "",
                targetField: "description",
                op: "contains",
              });
              form.setValue("operations", [...operations]);
              form.trigger();
            }}
          >
            Add Operation
          </Button>
          <FormMessage />
        </FormItem>
        <SheetClose asChild>
          <Button type="submit">Submit</Button>
        </SheetClose>
      </form>
    </Form>
  );
}
