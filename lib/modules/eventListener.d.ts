export declare enum EventName {
    READY = "READY",
    NETWORK_CHANGED = "NETWORK_CHANGED",
    ACCOUNT_CHANGED = "ACCOUNT_CHANGED"
}
export declare function addEventListener(event: EventName, callback: Function): void;
export declare function removeEventListener(event: EventName): void;
export declare function onEvent(event: EventName, data?: any): void;
//# sourceMappingURL=eventListener.d.ts.map