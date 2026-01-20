export type FloorId = "1" | "2" | "3";
export type RoomId = string;

export type DeviceType = "camera" | "alarm" | "sprinkler" | "access";

export type PlacedDevice = { id: string; type: DeviceType; x: number; y: number; nx: number; ny: number };

export type ToolbarDevice = { id: string; type: DeviceType; name?: string; status: string };

export type FsDeviceInfo = { name?: string; typeRaw?: string; status?: string };

export type StageBox = { x: number; y: number; w: number; h: number };

export type RoomRect = { x: number; y: number; w: number; h: number };
