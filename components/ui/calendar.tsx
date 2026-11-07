"use client";

import * as React from "react";
import {
  DayPicker,
  DayButton,
  getDefaultClassNames,
  UI,
  SelectionState,
  DayFlag,
} from "react-day-picker";
import type { ClassNames } from "react-day-picker";
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const defaultClassNames = getDefaultClassNames();

  const mergedClassNames: ClassNames = {
    ...defaultClassNames,
    [UI.Root]: cn("w-fit", defaultClassNames[UI.Root]),
    [UI.Months]: cn(
      "relative flex flex-col gap-4 sm:flex-row",
      defaultClassNames[UI.Months]
    ),
    [UI.Month]: cn("flex w-full flex-col gap-4", defaultClassNames[UI.Month]),
    [UI.Nav]: cn(
      "absolute inset-x-0 top-0 flex w-full items-center justify-between",
      defaultClassNames[UI.Nav]
    ),
    [UI.PreviousMonthButton]: cn(
      buttonVariants({ variant: buttonVariant }),
      "h-7 w-7 p-0 opacity-70 hover:opacity-100",
      defaultClassNames[UI.PreviousMonthButton]
    ),
    [UI.NextMonthButton]: cn(
      buttonVariants({ variant: buttonVariant }),
      "h-7 w-7 p-0 opacity-70 hover:opacity-100",
      defaultClassNames[UI.NextMonthButton]
    ),
    [UI.MonthCaption]: cn(
      "flex h-7 w-full items-center justify-center px-7",
      defaultClassNames[UI.MonthCaption]
    ),
    [UI.CaptionLabel]: cn(
      "select-none text-sm font-medium",
      captionLayout !== "label" && "flex h-7 items-center gap-1 rounded-md pl-1.5 text-sm",
      defaultClassNames[UI.CaptionLabel]
    ),
    [UI.Weekdays]: cn("flex", defaultClassNames[UI.Weekdays]),
    [UI.Weekday]: cn(
      "flex-1 select-none rounded-md text-[0.75rem] font-normal text-muted-foreground",
      defaultClassNames[UI.Weekday]
    ),
    [UI.Week]: cn("mt-2 flex w-full", defaultClassNames[UI.Week]),
    [UI.Day]: cn(
      "relative aspect-square h-full w-full p-0 text-center",
      defaultClassNames[UI.Day]
    ),
    [SelectionState.range_start]: "rounded-l-md bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground",
    [SelectionState.range_end]: "rounded-r-md bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground",
    [SelectionState.range_middle]: "bg-accent [&>button]:bg-transparent [&>button]:text-accent-foreground",
    [SelectionState.selected]: "[&>button]:bg-primary [&>button]:text-primary-foreground",
    [DayFlag.today]: "[&>button]:bg-muted [&>button]:text-foreground",
    [DayFlag.outside]: "text-muted-foreground",
    [DayFlag.disabled]: "text-muted-foreground opacity-50",
    [DayFlag.hidden]: "invisible",
    ...classNames,
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("bg-card p-3", className)}
      captionLayout={captionLayout}
      formatters={{
        formatCaption: (date) =>
          date.toLocaleString("en-US", { month: "short", year: "numeric" }),
        ...formatters,
      }}
      classNames={mergedClassNames}
      components={{
        Root: ({ className, rootRef, ...rootProps }) => (
          <div data-slot="calendar" ref={rootRef} className={cn(className)} {...rootProps} />
        ),
        Chevron: ({ className, orientation, ...chevronProps }) => {
          if (orientation === "left")
            return <ChevronLeftIcon className={cn("h-4 w-4", className)} {...chevronProps} />;
          if (orientation === "right")
            return <ChevronRightIcon className={cn("h-4 w-4", className)} {...chevronProps} />;
          return <ChevronDownIcon className={cn("h-4 w-4", className)} {...chevronProps} />;
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...weekNumberProps }) => (
          <td {...weekNumberProps}>
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              {children}
            </div>
          </td>
        ),
        ...components,
      }}
      {...props}
    />
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef<HTMLButtonElement>(null);

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected={modifiers.selected}
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "flex aspect-square h-full w-full min-w-7 flex-col gap-0 p-0 text-sm font-normal leading-none",
        "data-[range-end=true]:rounded-r-md data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
        "data-[range-start=true]:rounded-l-md data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground",
        defaultClassNames[UI.DayButton],
        className
      )}
      {...props}
    />
  );
}

export { Calendar, CalendarDayButton };
