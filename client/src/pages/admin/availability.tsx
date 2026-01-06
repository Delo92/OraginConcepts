import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Trash2 } from "lucide-react";
import type { Availability, BlockedDate } from "@shared/schema";

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AdminAvailability() {
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [selectedBlockDate, setSelectedBlockDate] = useState<Date | undefined>();
  const [blockReason, setBlockReason] = useState("");
  const { toast } = useToast();

  const { data: availability, isLoading: availabilityLoading } = useQuery<Availability[]>({
    queryKey: ["/api/availability"],
  });

  const { data: blockedDates, isLoading: blockedLoading } = useQuery<BlockedDate[]>({
    queryKey: ["/api/blocked-dates"],
  });

  const updateAvailabilityMutation = useMutation({
    mutationFn: async (data: Partial<Availability> & { id?: number; dayOfWeek: number }) => {
      if (data.id) {
        const res = await apiRequest("PATCH", `/api/availability/${data.id}`, data);
        return res.json();
      } else {
        const res = await apiRequest("POST", "/api/availability", data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({ title: "Success", description: "Availability updated!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addBlockedDateMutation = useMutation({
    mutationFn: async (data: { date: string; reason?: string }) => {
      const res = await apiRequest("POST", "/api/blocked-dates", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-dates"] });
      toast({ title: "Success", description: "Date blocked successfully!" });
      setBlockDialogOpen(false);
      setSelectedBlockDate(undefined);
      setBlockReason("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteBlockedDateMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/blocked-dates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blocked-dates"] });
      toast({ title: "Success", description: "Date unblocked!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getAvailabilityForDay = (dayOfWeek: number) => {
    return availability?.find((a) => a.dayOfWeek === dayOfWeek);
  };

  const handleToggleDay = (dayOfWeek: number, isAvailable: boolean) => {
    const existing = getAvailabilityForDay(dayOfWeek);
    if (existing) {
      updateAvailabilityMutation.mutate({
        id: existing.id,
        dayOfWeek,
        isAvailable,
      });
    } else {
      updateAvailabilityMutation.mutate({
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        isAvailable,
      });
    }
  };

  const handleUpdateTime = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    const existing = getAvailabilityForDay(dayOfWeek);
    if (existing) {
      updateAvailabilityMutation.mutate({
        id: existing.id,
        dayOfWeek,
        [field]: value,
      });
    }
  };

  const handleBlockDate = () => {
    if (selectedBlockDate) {
      addBlockedDateMutation.mutate({
        date: format(selectedBlockDate, "yyyy-MM-dd"),
        reason: blockReason || undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-normal mb-2" data-testid="text-admin-availability-title">
          Availability
        </h1>
        <p className="text-muted-foreground">Set your working hours and block specific dates.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-lg">Weekly Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            {availabilityLoading ? (
              <div className="space-y-4">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-40" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day, index) => {
                  const dayAvailability = getAvailabilityForDay(index);
                  const isAvailable = dayAvailability?.isAvailable ?? false;

                  return (
                    <div
                      key={day}
                      className="flex items-center justify-between gap-4 py-2 border-b last:border-0 flex-wrap"
                      data-testid={`row-day-${index}`}
                    >
                      <div className="flex items-center gap-3 min-w-32">
                        <Switch
                          checked={isAvailable}
                          onCheckedChange={(checked) => handleToggleDay(index, checked)}
                          data-testid={`switch-day-${index}`}
                        />
                        <span className={isAvailable ? "font-medium" : "text-muted-foreground"}>
                          {day}
                        </span>
                      </div>
                      {isAvailable && dayAvailability && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={dayAvailability.startTime}
                            onChange={(e) => handleUpdateTime(index, "startTime", e.target.value)}
                            className="w-32"
                            data-testid={`input-start-${index}`}
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={dayAvailability.endTime}
                            onChange={(e) => handleUpdateTime(index, "endTime", e.target.value)}
                            className="w-32"
                            data-testid={`input-end-${index}`}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-serif text-lg">Blocked Dates</CardTitle>
            <Button size="sm" onClick={() => setBlockDialogOpen(true)} data-testid="button-add-blocked-date">
              <Plus className="h-4 w-4 mr-1" />
              Block Date
            </Button>
          </CardHeader>
          <CardContent>
            {blockedLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : blockedDates && blockedDates.length > 0 ? (
              <div className="space-y-2">
                {blockedDates.map((blocked) => (
                  <div
                    key={blocked.id}
                    className="flex items-center justify-between gap-2 py-2 border-b last:border-0 flex-wrap"
                    data-testid={`row-blocked-${blocked.id}`}
                  >
                    <div>
                      <p className="font-medium">
                        {format(new Date(blocked.date), "MMMM d, yyyy")}
                      </p>
                      {blocked.reason && (
                        <p className="text-sm text-muted-foreground">{blocked.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBlockedDateMutation.mutate(blocked.id)}
                      data-testid={`button-unblock-${blocked.id}`}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No blocked dates. You can block specific dates when you're unavailable.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif">Block a Date</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label className="mb-2 block">Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedBlockDate}
                onSelect={setSelectedBlockDate}
                className="rounded-md border"
                data-testid="calendar-block-date"
              />
            </div>
            <div>
              <Label htmlFor="reason" className="mb-2 block">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Holiday, Personal day..."
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="resize-none"
                data-testid="input-block-reason"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBlockDate}
                disabled={!selectedBlockDate || addBlockedDateMutation.isPending}
                data-testid="button-confirm-block"
              >
                {addBlockedDateMutation.isPending ? "Blocking..." : "Block Date"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
