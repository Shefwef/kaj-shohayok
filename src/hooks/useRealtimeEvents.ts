"use client";

import { useEffect, useCallback } from "react";

type EventHandler = (data: unknown) => void;

interface UseRealtimeEventsOptions {
  onTaskUpdated?: EventHandler;
  onTaskCreated?: EventHandler;
  onTaskAssigned?: EventHandler;
  onTaskDeleted?: EventHandler;
  onCommentAdded?: EventHandler;
  onConnected?: () => void;
}

export function useRealtimeEvents(options: UseRealtimeEventsOptions) {
  const handleEvent = useCallback(
    (eventType: string, data: unknown) => {
      switch (eventType) {
        case "task:updated":
          options.onTaskUpdated?.(data);
          break;
        case "task:created":
          options.onTaskCreated?.(data);
          break;
        case "task:assigned":
          options.onTaskAssigned?.(data);
          break;
        case "task:deleted":
          options.onTaskDeleted?.(data);
          break;
        case "comment:added":
          options.onCommentAdded?.(data);
          break;
        case "connected":
          options.onConnected?.();
          break;
      }
    },
    [options]
  );

  useEffect(() => {
    const eventSource = new EventSource("/api/events");

    const eventTypes = [
      "connected",
      "task:updated",
      "task:created",
      "task:assigned",
      "task:deleted",
      "comment:added",
    ];

    eventTypes.forEach((eventType) => {
      eventSource.addEventListener(eventType, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          handleEvent(eventType, data);
        } catch {
          handleEvent(eventType, e.data);
        }
      });
    });

    eventSource.onerror = () => {
      // Reconnect happens automatically with EventSource
    };

    return () => {
      eventSource.close();
    };
  }, [handleEvent]);
}
