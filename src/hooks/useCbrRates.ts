import { useEffect, useMemo, useState } from 'react';

type CbrResponse = {
    Valute?: Record<
        string,
        {
            CharCode: string;
            Nominal: number;
            Value: number;
        }
    >;
};

const API_URL = 'https://www.cbr-xml-daily.ru/daily_json.js';

export type RatesMap = Record<string, number>;

export const useCbrRates = (codes: string[]) => {
    const [rates, setRates] = useState<RatesMap>({ RUB: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const normalizedCodes = useMemo(() => Array.from(new Set(['RUB', ...codes])), [codes]);

    useEffect(() => {
        let isMounted = true;

        const fetchRates = async () => {
            setLoading(true);
            try {
                const response = await fetch(API_URL);
                if (!response.ok) {
                    throw new Error('ЦБ РФ временно недоступен');
                }

                const data: CbrResponse = await response.json();
                const valute = data.Valute || {};
                const result: RatesMap = { RUB: 1 };

                normalizedCodes.forEach((code) => {
                    if (code === 'RUB') {
                        result.RUB = 1;
                        return;
                    }

                    const entry = valute[code];
                    if (entry) {
                        result[code] = entry.Value / entry.Nominal;
                    }
                });

                if (normalizedCodes.includes('USDT') && !result.USDT && result.USD) {
                    result.USDT = result.USD;
                }

                if (isMounted) {
                    setRates(result);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : 'Ошибка загрузки курсов');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchRates();

        return () => {
            isMounted = false;
        };
    }, [normalizedCodes]);

    return { rates, loading, error };
};

