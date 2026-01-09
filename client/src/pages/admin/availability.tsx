import { useState, useEffect } from "react";
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
import { Plus, Trash2, Save } from "lucide-react";
import type { Availability, BlockedDate } from "@shared/schema";

type LocalSchedule = {
  [dayOfWeek: number]: {
    id?: number;
    isAvailable: boolean;
    startTime: string;
    endTime: string;
  };
};

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
  const [localSchedule, setLocalSchedule] = useState<LocalSchedule>({});
  const [hasChanges, setHasChanges] = useState(false);
  const { toast } = useToast();

  const { data: availability, isLoading: availabilityLoading } = useQuery<Availability[]>({
    queryKey: ["/api/availability"],
  });

  const { data: blockedDates, isLoading: blockedLoading } = useQuery<BlockedDate[]>({
    queryKey: ["/api/blocked-dates"],
  });

  useEffect(() => {
    if (availability) {
      const schedule: LocalSchedule = {};
      for (let i = 0; i < 7; i++) {
        const dayData = availability.find((a) => a.dayOfWeek === i);
        schedule[i] = {
          id: dayData?.id,
          isAvailable: dayData?.isAvailable ?? false,
          startTime: dayData?.startTime ?? "09:00",
          endTime: dayData?.endTime ?? "17:00",
        };
      }
      setLocalSchedule(schedule);
      setHasChanges(false);
    }
  }, [availability]);

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

  const handleToggleDay = (dayOfWeek: number, isAvailable: boolean) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        isAvailable,
        startTime: prev[dayOfWeek]?.startTime ?? "09:00",
        endTime: prev[dayOfWeek]?.endTime ?? "17:00",
      },
    }));
    setHasChanges(true);
  };

  const handleUpdateTime = (dayOfWeek: number, field: "startTime" | "endTime", value: string) => {
    setLocalSchedule((prev) => ({
      ...prev,
      [dayOfWeek]: {
        ...prev[dayOfWeek],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSaveSchedule = async () => {
    const promises = Object.entries(localSchedule).map(([day, data]) => {
      const dayOfWeek = parseInt(day);
      return updateAvailabilityMutation.mutateAsync({
        id: data.id,
        dayOfWeek,
        isAvailable: data.isAvailable,
        startTime: data.startTime,
        endTime: data.endTime,
      });
    });

    try {
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      toast({ title: "Success", description: "Schedule saved!" });
      setHasChanges(false);
    } catch (error) {
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
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-serif text-lg">Weekly Schedule</CardTitle>
            {hasChanges && (
              <Button
                size="sm"
                onClick={handleSaveSchedule}
                disabled={updateAvailabilityMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1" />
                {updateAvailabilityMutation.isPending ? "Saving..." : "Save Schedule"}
              </Button>
            )}
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
                  const dayData = localSchedule[index];
                  const isAvailable = dayData?.isAvailable ?? false;

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
                      {isAvailable && dayData && (
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={dayData.startTime}
                            onChange={(e) => handleUpdateTime(index, "startTime", e.target.value)}
                            className="w-32"
                            data-testid={`input-start-${index}`}
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input
                            type="time"
                            value={dayData.endTime}
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
