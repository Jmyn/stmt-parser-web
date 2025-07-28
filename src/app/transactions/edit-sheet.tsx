import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TransactionInfo } from "./types";
import { Separator } from "@/components/ui/separator";
import { RuleAdder } from "./rules/rule-adder";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ClipboardCopyIcon } from "lucide-react";

interface EditSheetProps {
  transaction: TransactionInfo;
}

export function EditSheet({ transaction }: EditSheetProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Sheet key={"right"}>
        <SheetTrigger asChild>
          <Button variant="outline">{"Categorise"}</Button>
        </SheetTrigger>
        <SheetContent side={"right"}>
          <ScrollArea className="w-full h-full">
            <SheetHeader>
              <SheetTitle>Categorise Transaction</SheetTitle>
              <SheetDescription>
                Add rule for categorisation here. Click save when you&#39;re done.
              </SheetDescription>
            </SheetHeader>
            <div className="grid gap-5 py-5">
              <div className="grid grid-cols-5 items-center gap-5">
                <Label htmlFor="id" className="text-left">
                  ID
                </Label>
                <span id="id" className="col-span-3">
                  {transaction.id}
                </span>
              </div>
              <div className="grid grid-cols-5 items-center gap-5">
                <Label htmlFor="source" className="text-left">
                  Source
                </Label>
                <span id="source" className="col-span-3">
                  {transaction.source}
                </span>
                <Button
                  onClick={async () =>
                    await navigator.clipboard.writeText(transaction.source)
                  }
                >
                  <ClipboardCopyIcon />
                </Button>
              </div>
              <div className="grid grid-cols-5 items-center gap-5">
                <Label htmlFor="sourceAccountNo" className="text-left">
                  AccNo
                </Label>
                <span id="sourceAccountNo" className="col-span-3">
                  {transaction.sourceAccountNo}
                </span>
                <Button
                  onClick={async () =>
                    await navigator.clipboard.writeText(
                      transaction.sourceAccountNo
                    )
                  }
                >
                  <ClipboardCopyIcon />
                </Button>
              </div>
              <div className="grid grid-cols-5 items-center gap-5">
                <Label htmlFor="description" className="text-left">
                  Description
                </Label>
                <span id="description" className="col-span-3">
                  {transaction.description}
                </span>

                <Button
                  onClick={async () =>
                    await navigator.clipboard.writeText(transaction.description)
                  }
                >
                  <ClipboardCopyIcon />
                </Button>
              </div>
              <div className="grid grid-cols-5 items-center gap-5">
                <Label htmlFor="hash" className="text-left">
                  Hash
                </Label>
                <span id="description" className="col-span-3">
                  {transaction.hash}
                </span>
                <Button
                  onClick={async () =>
                    await navigator.clipboard.writeText(transaction.hash)
                  }
                >
                  <ClipboardCopyIcon />
                </Button>
              </div>
            </div>
            <Separator />
            <RuleAdder />
            <SheetFooter>
              <SheetClose asChild>
                <Button type="submit">Close</Button>
              </SheetClose>
            </SheetFooter>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
