// js/mathUtils.js
import { ASSET_CLASSES } from './config.js?v=16.2';

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

export function calcDeterministicStats(weights, cma, alpha = 0, te = 0) {
    let ret = alpha; 
    let sum_ce = 0; let sum_cc = 0; let sum_basis = 0; let sum_idio_sq = 0;
    let port_k = 0; 
    
    ASSET_CLASSES.forEach(ac => {
        const w = weights[ac.key] || 0;
        if(w === 0) return;
        const mu = cma.r[ac.key] || 0; 
        const vol = cma.v[ac.key] || 0;
        const k = cma.k[ac.key] || 0;
        
        let ce = cma.ce[ac.key] || 0; 
        let cc = cma.cc[ac.key] || 0;
        const sumSq = ce*ce + cc*cc;
        if (sumSq > 1) { ce = ce / Math.sqrt(sumSq); cc = cc / Math.sqrt(sumSq); }
        
        const resid = Math.sqrt(Math.max(0, 1 - ce*ce - cc*cc));
        
        ret += w * mu; 
        port_k += w * k;
        
        sum_ce += w * vol * ce; 
        sum_cc += w * vol * cc; 
        sum_basis += w * vol * resid * Math.sqrt(0.3);
        sum_idio_sq += Math.pow(w * vol * resid * Math.sqrt(0.7), 2);
    });
    
    const portVariance = Math.pow(sum_ce, 2) + Math.pow(sum_cc, 2) + Math.pow(sum_basis, 2) + sum_idio_sq + Math.pow(te, 2);
    const portVol = Math.sqrt(portVariance);
    
    const kurtosisAdjustment = Math.exp(-0.005 * port_k); 
    const median20Yr = Math.pow(1 + ret - (portVariance / 2), 20) * kurtosisAdjustment;
    
    return { arithRet: ret, median20Yr: median20Yr, vol: portVol };
}
