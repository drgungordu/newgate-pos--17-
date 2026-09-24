export type Money = number;

export const money = (value: number): Money => Math.round(value * 100) / 100;
export const addMoney = (...values: number[]): Money => money(values.reduce((sum, value) => sum + value, 0));
export const subtractMoney = (left: number, right: number): Money => money(left - right);
