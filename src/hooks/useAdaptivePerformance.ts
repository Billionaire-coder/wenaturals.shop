"use client";

import { useState, useEffect } from 'react';

interface AdaptivePerformance {
    isLowEnd: boolean;
    connectionType: string;
    saveData: boolean;
}

export function useAdaptivePerformance() {
    const [performance, setPerformance] = useState<AdaptivePerformance>({
        isLowEnd: false,
        connectionType: 'unknown',
        saveData: false,
    });

    useEffect(() => {
        const nav = navigator as Navigator & {
            connection?: {
                effectiveType: string;
                saveData: boolean;
                addEventListener: (type: string, listener: (e: Event) => void) => void;
                removeEventListener: (type: string, listener: (e: Event) => void) => void;
            };
            mozConnection?: {
                effectiveType: string;
                saveData: boolean;
                addEventListener: (type: string, listener: (e: Event) => void) => void;
                removeEventListener: (type: string, listener: (e: Event) => void) => void;
            };
            webkitConnection?: {
                effectiveType: string;
                saveData: boolean;
                addEventListener: (type: string, listener: (e: Event) => void) => void;
                removeEventListener: (type: string, listener: (e: Event) => void) => void;
            };
            deviceMemory?: number;
            getBattery?: () => Promise<{ saveData?: boolean; level: number; charging: boolean }>;
        };
        const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

        const updatePerformance = async () => {
            const isSlow = conn ? (['slow-2g', '2g', '3g'].includes(conn.effectiveType)) : false;
            const isSaveData = conn ? conn.saveData : false;
            const isLowMemory = nav.deviceMemory ? nav.deviceMemory < 4 : false;

            let isLowBattery = false;
            try {
                if (nav.getBattery) {
                    const battery = await nav.getBattery();
                    const b = battery as { saveData?: boolean; level: number; charging: boolean };
                    isLowBattery = b.saveData || (b.level < 0.2 && !b.charging);
                }
            } catch { }

            setPerformance({
                isLowEnd: isSlow || isLowMemory || isSaveData || isLowBattery,
                connectionType: conn ? conn.effectiveType : 'unknown',
                saveData: isSaveData,
            });
        };

        updatePerformance();

        if (conn && conn.addEventListener) {
            conn.addEventListener('change', updatePerformance);
            return () => conn.removeEventListener('change', updatePerformance);
        }
    }, []);

    return performance;
}
