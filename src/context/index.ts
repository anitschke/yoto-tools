import { createContext } from '@lit/context';
import { AuthSession, Card, Device } from '../models/index.js';

// ==============================================================================
// Lit Context Definitions for App-wide Reactive State
// See: AGENTS.md, RFC 003, RFC 006
// ==============================================================================

export const authContext = createContext<AuthSession | null>('auth');
export const cardsContext = createContext<Card[]>('cards');
export const currentCardContext = createContext<Card | null>('currentCard');
export const devicesContext = createContext<Device[]>('devices');
