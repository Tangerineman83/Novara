// js/config.js
export const ASSET_CLASSES = [
    { key: "globalEq", name: "Global Equity", defaultR: 0.05, defaultV: 0.15 },
    { key: "privAssets", name: "Diversified Private Assets", defaultR: 0.06, defaultV: 0.12 },
    { key: "realEstate", name: "Real Estate", defaultR: 0.04, defaultV: 0.10 },
    { key: "listedAlts", name: "Listed Alternatives", defaultR: 0.045, defaultV: 0.08 },
    { key: "emDebt", name: "Emerging Market Debt", defaultR: 0.055, defaultV: 0.12 },
    { key: "igCredit", name: "Investment Grade Credit", defaultR: 0.03, defaultV: 0.05 },
    { key: "sdCredit", name: "Short Duration Credit", defaultR: 0.025, defaultV: 0.03 },
    { key: "moneyMkt", name: "Money Markets", defaultR: 0.015, defaultV: 0.01 }
];

export const DEFAULTS = {
    inflation: 2.5,
    simulations: 2000,
    withdrawalRate: 5
};
