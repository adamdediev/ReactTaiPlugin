import React from 'react';
import { Button, InputNumber, Select, Space } from 'antd';
import CurrencyFlag from 'react-currency-flags';
import { getCurrencyOptions, getCurrencyMeta } from './data';

type ExchangeFormProps = {
    currency: string;
    amount: number;
    onCurrencyChange: (value: string) => void;
    onAmountChange: (value: number) => void;
    disabled?: boolean;
};

const ExchangeForm = ({
    currency,
    amount,
    onCurrencyChange,
    onAmountChange,
    disabled,
}: ExchangeFormProps) => {
    const currencyOptions = getCurrencyOptions();
    const currencyMetaData = getCurrencyMeta();
    
    const optionsWithFlags = currencyOptions.map((option) => {
        const meta = currencyMetaData[option.value];
        
        return {
            value: option.value,
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Если есть URL иконки, используем её */}
                    {meta?.icon ? (
                        <img 
                            src={meta.icon} 
                            alt={option.value}
                            className="exchange-form__flag-icon"
                            style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : meta?.isCrypto && meta?.flag ? (
                        <span style={{ fontSize: '24px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden' }}>
                            {meta.flag}
                        </span>
                    ) : (
                        <CurrencyFlag 
                            currency={option.value} 
                            className="exchange-form__flag-icon"
                        />
                    )}
                    <span>{option.label}</span>
                </span>
            ),
        };
    });

    return (
        <div className="exchange-form">
            <Space.Compact size="large" className="exchange-form__controls">
                <Select
                    value={currency}
                    options={optionsWithFlags}
                    onChange={onCurrencyChange}
                    popupMatchSelectWidth={200}
                    disabled={disabled}
                />
                <InputNumber
                    value={amount}
                    min={0}
                    max={1000000000000}
                    formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
                    }
                    parser={(value) => Number(value?.replace(/\./g, '') || 0)}
                    onChange={(value) => onAmountChange(value ?? 0)}
                    className="exchange-form__input"
                    disabled={disabled}
                    controls={false} 
                />
            </Space.Compact>
            <Button type="primary" size="large" className="exchange-form__button" disabled={disabled}>
               Обменять
            </Button>
        </div>
    );
};

export default ExchangeForm;

