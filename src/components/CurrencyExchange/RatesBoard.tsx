import React, { useMemo } from 'react';
import { Button, Card, List, Skeleton, Typography } from 'antd';
import CurrencyFlag from 'react-currency-flags';
import * as TokenIcons from '@token-icons/react';
import { currencyMeta, payoutCurrencyCodes } from './data';
import DynamicClock from '../DynamicClock/DynamicClock';

const largeNumberFormatter = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
});

const preciseNumberFormatter = new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const formatAmount = (value: number) =>
    value >= 100 ? largeNumberFormatter.format(value) : preciseNumberFormatter.format(value);

// Функция для получения иконки токена
const getTokenIcon = (code: string) => {
    const iconName = `Token${code}` as keyof typeof TokenIcons;
    return TokenIcons[iconName] as React.ReactNode || null;
};

type RatesBoardProps = {
    baseCurrency: string;
    baseAmount: number;
    rates: Record<string, number>;
    loading: boolean;
    error: string | null;
};

const RatesBoard = ({ baseCurrency, baseAmount, rates, loading, error }: RatesBoardProps) => {
    const conversions = useMemo(() => {
        const baseRate = rates[baseCurrency];
        if (!baseRate) return [];

        const amountInRub = baseAmount * baseRate;

        return payoutCurrencyCodes.map((code) => {
            const targetRate = rates[code];
            const meta = currencyMeta[code];
            if (!targetRate || !meta) {
                return {
                    code,
                    flag: meta?.flag || '',
                    icon: meta?.icon,
                    payoutMarkup: meta?.payoutMarkup || 0,
                    conversion: 'Нет данных',
                    amount: 0,
                    ready: false,
                };
            }

            // Применяем процент увеличения при выводе
            const markupMultiplier = 1 + (meta.payoutMarkup / 100);
            const targetAmount = (amountInRub / targetRate) * markupMultiplier;
            
            return {
                code: meta.code,
                flag: meta.flag,
                icon: meta.icon,
                payoutMarkup: meta.payoutMarkup,
                conversion: `1 ${meta.code} = ${targetRate.toFixed(2)} RUB`,
                amount: targetAmount,
                ready: true,
            };
        });
    }, [baseAmount, baseCurrency, rates]);

    return (
        <Card
            className="rates-board"
            bordered={false}
            style={{ borderRadius: 28 }}
        >
            <div className="rates-board__header">
           
                    <Typography.Text className="rates-board__label">
                        Вы получаете
                    </Typography.Text>
               
                <Typography.Text className="rates-board__subtitle">
                  <DynamicClock />
                </Typography.Text>
            </div>
            {loading ? (
                <Skeleton active paragraph={{ rows: 5 }} title={false} className="rates-board__skeleton" />
            ) : error ? (
                <Typography.Text type="danger">{error}</Typography.Text>
            ) : (
                <List
                    dataSource={conversions}
                    split={false}
                    renderItem={(item) => (
                        <List.Item className="rates-board__item" key={item.code}>
                            <div className="rates-board__currency">
                                <div className="rates-board__icon-wrapper">
                                    {(() => {
                                        const meta = currencyMeta[item.code];
                                        if (meta?.isCrypto) {
                                            const TokenIcon = getTokenIcon(item.code);
                                            if (TokenIcon) {
                                                return <TokenIcon size={30} className="rates-board__flag-icon" />;
                                            }
                                        }
                                        return (
                                            <CurrencyFlag 
                                                currency={item.code} 
                                                className="rates-board__flag-icon"
                                            />
                                        );
                                    })()}
                                </div>
                                <Typography.Text className="rates-board__code">
                                    {item.code}
                                </Typography.Text>
                            </div>
                            <div className="rates-board__right">
                                <Typography.Text
                                    type="secondary"
                                    className="rates-board__conversion"
                                >
                                    {item.conversion}
                                </Typography.Text>
                                <Typography.Text className="rates-board__amount">
                                    {item.ready ? formatAmount(item.amount) : '—'}
                                </Typography.Text>
                            </div>
                        </List.Item>
                    )}
                />
            )}
        </Card>
    );
};

export default RatesBoard;

