// js/mathUtils.js
import { ASSET_CLASSES } from './config.js?v=16.3';

export function logGamma(z) {
    let co = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    let x = z, y = z, tmp = x + 5.5, ser = 1.000000000190015;
    tmp -= (x + 0.5) * Math.log(tmp);
    for (let j = 0; j < 6; j++) ser += co[j] / ++y;
    return Math.log(2.5066282746310005 * ser / x) - tmp;
}

export function getMatrixHeatmapBg(val) {
    if (val === 0) return 'background-color: #F8FAFC; color: #64748B;';
    if (val < 0) {
        const alpha = Math.min(Math.abs(val) / 0.5, 0.9); 
        const textColor = alpha > 0.5 ? '#FFFFFF' : '#7F1D1D';
        return `background-color: rgba(220, 38, 38, ${Math.max(0.1, alpha)}); color: ${textColor};`;
    } else {
        const alpha = Math.min(val / 0.3, 0.6); 
        const textColor = alpha > 0.4 ? '#FFFFFF' : '#064E3B';
        return `background-color: rgba(16, 185, 129, ${Math.max(0.15, alpha)}); color: ${textColor};`;
    }
}

export function getCorrHeatmapBg(val) {
    if (val === 1) return 'background-color: #0F172A; color: #FFFFFF;';
    if (val >= 0) {
        const alpha = Math.min(val, 0.9);
        const textColor = alpha > 0.4 ? '#FFFFFF' : '#1E293B';
        return `background-color: rgba(59, 130, 246, ${Math.max(0.05, alpha)}); color: ${textColor};`;
    } else {
        const alpha = Math.min(Math.abs(val), 0.9);
        const textColor = alpha > 0.4 ? '#FFFFFF' : '#1E293B';
        return `background-color: rgba(239, 68, 68, ${Math.max(0.05, alpha)}); color: ${textColor};`;
    }
}

export function calcDeterministicStats(weights, cma, alpha = 0, te = 0) {
    let ret = alpha; 
    let port_k = 0; 
    let sum_variance = 0;
    
    ASSET_CLASSES.forEach(ac => {
        const w = weights[ac.key] || 0;
        if(w === 0) return;
        ret += w * (cma.r[ac.key] || 0); 
        port_k += w * (cma.k[ac.key] || 0);
    });
    
    ASSET_CLASSES.forEach((ac1) => {
        const w1 = weights[ac1.key] || 0;
        if (w1 === 0) return;
        ASSET_CLASSES.forEach((ac2) => {
            const w2 = weights[ac2.key] || 0;
            if (w2 === 0) return;
            
            // Mathematical safeguard: Self-correlation must be 1.0
            let corr = 0;
            if (ac1.key === ac2.key) {
                corr = 1.0;
            } else {
                corr = (cma.correlations[ac1.key] && cma.correlations[ac1.key][ac2.key]) !== undefined 
                     ? cma.correlations[ac1.key][ac2.key] : 0;
            }
            
            const cov = (cma.v[ac1.key] || 0) * (cma.v[ac2.key] || 0) * corr;
            sum_variance += w1 * w2 * cov;
        });
    });
    
    const portVariance = sum_variance + Math.pow(te, 2);
    const portVol = Math.sqrt(portVariance);
    
    const kurtosisAdjustment = Math.exp(-0.005 * port_k); 
    const median20Yr = Math.pow(1 + ret - (portVariance / 2), 20) * kurtosisAdjustment;
    
    return { arithRet: ret, median20Yr: median20Yr, vol: portVol };
}
