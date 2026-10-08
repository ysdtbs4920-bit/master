/**
 * 見出し付きの選択欄。設備専用ではなく、任意の選択肢を渡せます。
 * optionsのvalueは内部の値、labelは画面に表示する文字です。
 * onValueChangeは選択が変わったときに親へ通知する関数です。
 */

import { useId } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { SelectOption } from "./types";

type DataSelectProps = {
  label: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
};

export function DataSelect({
  label,
  options,
  value,
  onValueChange,
  className,
}: DataSelectProps) {
  // 各選択欄に一意のIDを付け、見出しと入力欄を対応させます。
  const id = useId();

  return (
    <div className={cn("w-48 space-y-2", className)}>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder={`${label}を選択`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
