"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => {
    // Fix Leaflet default icon issue (only on client)
    if (typeof window !== "undefined") {
      const L = require("leaflet");
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });
    }
    return mod.MapContainer;
  }),
  { ssr: false }
);
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });

export function MapModal({
  open,
  onOpenChange,
  latitude,
  longitude,
  address,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  latitude: number;
  longitude: number;
  address?: string | null;
}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Location Map</DialogTitle>
            <DialogDescription>Loading map...</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>Geographic Location</DialogTitle>
          <DialogDescription>
            {address ? (
              <>
                <span className="font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                <br />
                {address}
              </>
            ) : (
              <span className="font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="h-[400px] w-full rounded-md overflow-hidden border">
          <MapContainer
            center={[latitude, longitude]}
            zoom={15}
            style={{ height: "100%", width: "100%" }}
            key={`${latitude}-${longitude}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[latitude, longitude]}>
              <Popup>
                <div className="text-sm">
                  <strong>Coordinates:</strong>
                  <br />
                  <span className="font-mono">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
                  {address && (
                    <>
                      <br />
                      <br />
                      <strong>Address:</strong>
                      <br />
                      {address}
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        <div className="text-xs text-muted-foreground text-center">
          <a
            href={`https://maps.google.com/?q=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Open in Google Maps
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

