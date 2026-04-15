// Orvo shared types, schemas, and utilities
// This package is consumed by @orvo/web and @orvo/mobile

export const ORVO_VERSION = '0.1.0';

// Super-app type namespace (shopping, delivery, rideshare, trips, tickets,
// marketplace, pricing, integration contract). Exposed as a namespace so
// consumers can say `SuperApp.Money` without polluting the top-level.
export * as SuperApp from './super-app';
