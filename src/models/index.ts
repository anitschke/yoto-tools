// ==============================================================================
// Domain Models for Yoto Tools
// Ported & extended from yotocli (pkg/yoto/models.go)
// ==============================================================================

export interface Card {
  cardId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  content?: Content;
  metadata?: Metadata;
  [key: string]: unknown; // Preserve unrecognized passthrough fields per AGENTS.md
}

export interface Content {
  chapters: Chapter[];
  [key: string]: unknown;
}

export interface Chapter {
  key: string;
  title: string;
  duration?: number;
  tracks: Track[];
  display?: Display;
  overlayLabel?: string;
  [key: string]: unknown;
}

export interface Track {
  key: string;
  title: string;
  trackUrl: string;
  duration?: number;
  fileSize?: number;
  format?: string;
  display?: Display;
  overlayLabel?: string;
  type?: string;
  [key: string]: unknown;
}

export interface Display {
  icon16x16?: string;
  [key: string]: unknown;
}

export interface Metadata {
  author?: string;
  description?: string;
  media?: Media;
  [key: string]: unknown;
}

export interface Media {
  duration?: number;
  fileSize?: number;
  [key: string]: unknown;
}

export interface LibraryItem {
  cardId: string;
  card: Card;
}

export interface LibraryResponse {
  cards: LibraryItem[];
}

export interface Device {
  deviceId: string;
  name: string;
  deviceType: string;
  online: boolean;
  status?: DeviceStatus;
}

export interface DeviceStatus {
  statusVersion?: number;
  fwVersion?: string;
  productType?: string;
  batteryLevel: number;
  charging: boolean;
  freeDisk?: number;
  als?: number;
  activeCard?: string;
  cardInserted?: boolean;
  playingStatus?: string;
  headphones?: boolean;
  bluetoothHp?: boolean;
  volume: number;
  userVolume?: number;
  timeFormat?: string;
  nightlightMode?: string;
  day?: boolean;
}

export interface DisplayIcon {
  displayIconId: string;
  mediaId: string;
  title: string;
  url: string;
  userId?: string;
  public?: boolean;
  new?: boolean;
  publicTags?: string[];
  createdAt?: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix timestamp ms
  idToken?: string;
  user?: {
    email?: string;
    name?: string;
    sub?: string;
  };
}
