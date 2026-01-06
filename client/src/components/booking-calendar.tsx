import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import { useState } from "react";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface BookingCalendarProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  onTimeSelect: (time: string | undefined) => void;
  availableSlots: TimeSlot[];
  blockedDates: string[];
  isLoading?: boolean;
}

export function BookingCalendar({
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  availableSlots,
  blockedDates,
  isLoading,
}: BookingCalendarProps) {
  const today = startOfDay(new Date());
  const maxDate = addDays(today, 60);

  const isDateDisabled = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return (
      isBefore(date, today) ||
      isBefore(maxDate, date) ||
      blockedDates.includes(dateStr)
    );
  };

  const formatTimeDisplay = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg">Select a Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            disabled={isDateDisabled}
            className="rounded-md"
            data-testid="calendar-booking"
          />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="font-serif text-lg">
            {selectedDate
              ? `Available Times - ${format(selectedDate, "MMM d")}`
              : "Select a Date First"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-muted animate-pulse rounded-md" />
              ))}
            </div>
          ) : selectedDate ? (
            availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {availableSlots.map((slot) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    onClick={() => onTimeSelect(slot.time)}
                    className="w-full"
                    data-testid={`button-time-${slot.time}`}
                  >
                    {formatTimeDisplay(slot.time)}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">
                No available times for this date. Please select another date.
              </p>
            )
          ) : (
            <p className="text-muted-foreground text-sm text-center py-8">
              Please select a date to see available times.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
