/* 3D packaging models: geometry, model data and WebGL 2 renderer carried over unchanged from the approved V6 build.
   These are mockups made from the product images, not scans. The viewer controls live in app.js. */
"use strict";
function smIdentity() { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
function smMultiply(a, b) { const o = new Float32Array(16); for (let c = 0; c < 4; c++)
    for (let r = 0; r < 4; r++)
        for (let k = 0; k < 4; k++)
            o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k]; return o; }
function smTranslate(x, y, z) { const m = smIdentity(); m[12] = x; m[13] = y; m[14] = z; return m; }
function smRotateY(a) { const m = smIdentity(), c = Math.cos(a), s = Math.sin(a); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
function smPerspective(fov, aspect, near, far) { const f = 1 / Math.tan(fov / 2); return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]); }
function smLookAt(eye, target) { const norm = (v) => { const n = Math.hypot(...v); return v.map(a => a / n); }, cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], dot = (a, b) => a.reduce((n, v, i) => n + v * b[i], 0); const z = norm(eye.map((v, i) => v - target[i])), x = norm(cross([0, 1, 0], z)), y = cross(z, x); return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]); }
function sClamp(n, min = 0, max = 1) { return Math.max(min, Math.min(max, n)); }
function sSmooth(a, b, t) { const x = sClamp((t - a) / (b - a)); return x * x * (3 - 2 * x); }
/** Revolve a measured image silhouette. The model itself remains an approximation. */
function sLathe(profile, segments = 96) {
    const v = [], idx = [];
    for (let j = 0; j < profile.length; j++) {
        const [y, r, uv] = profile[j], a = profile[Math.max(0, j - 1)], b = profile[Math.min(profile.length - 1, j + 1)];
        const slope = (b[1] - a[1]) / Math.max(.0001, b[0] - a[0]);
        for (let i = 0; i <= segments; i++) {
            const u = i / segments, theta = (u * 2 - 1) * Math.PI, n = Math.hypot(1, slope), sn = Math.sin(theta), cs = Math.cos(theta);
            v.push(r * sn, y, r * cs, sn / n, -slope / n, cs / n, u, uv);
        }
    }
    for (let j = 0; j < profile.length - 1; j++)
        for (let i = 0; i < segments; i++) {
            const a = j * (segments + 1) + i, b = a + segments + 1;
            idx.push(a, a + 1, b, a + 1, b + 1, b);
        }
    return { vertices: new Float32Array(v), indices: new Uint16Array(idx) };
}
function sDisc(radius, y, up = 1, inner = 0) {
    const v = [], idx = [];
    const n = 96;
    for (let i = 0; i <= n; i++) {
        const t = i / n * Math.PI * 2;
        for (const r of [inner, radius])
            v.push(r * Math.sin(t), y, r * Math.cos(t), 0, up, 0, 0, 0);
    }
    for (let i = 0; i < n; i++) {
        const a = i * 2;
        if (up > 0)
            idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
        else
            idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    return { vertices: new Float32Array(v), indices: new Uint16Array(idx) };
}
/** Generated from content/spatial. Photo-based mockups, not scans. */
const spatialModelData = { "chyawanprash": { "id": "chyawanprash", "type": "jar", "sourceCutout": "ref-chyawanprash-cutout.webp", "texture": "model-chyawanprash-atlas.jpg", "height": 3.4, "width": 2.65764192139738, "body": [[0.07424, 0.04751, 0.02193], [0.10393, 0.20044, 0.030702], [0.13362, 0.40533, 0.039474], [0.16332, 0.5345, 0.048246], [0.20786, 0.68, 0.061404], [0.23755, 0.76017, 0.070175], [0.26725, 0.83293, 0.078947], [0.29694, 0.89677, 0.087719], [0.32664, 0.94576, 0.096491], [0.35633, 0.97991, 0.105263], [0.40087, 1.01258, 0.118421], [0.43057, 1.02594, 0.127193], [0.46026, 1.0393, 0.135965], [0.48996, 1.04821, 0.144737], [0.51965, 1.05563, 0.153509], [0.54934, 1.06009, 0.162281], [0.57904, 1.06157, 0.171053], [0.62358, 1.06603, 0.184211], [0.65328, 1.069, 0.192982], [0.68297, 1.069, 0.201754], [0.71266, 1.069, 0.210526], [0.74236, 1.07197, 0.219298], [0.77205, 1.07197, 0.22807], [0.81659, 1.07345, 0.241228], [0.84629, 1.07493, 0.25], [0.87598, 1.07493, 0.258772], [0.90568, 1.07642, 0.267544], [0.93537, 1.07642, 0.276316], [0.96507, 1.07642, 0.285088], [0.99476, 1.07939, 0.29386], [1.0393, 1.08087, 0.307018], [1.069, 1.08087, 0.315789], [1.09869, 1.08236, 0.324561], [1.12838, 1.08236, 0.333333], [1.15808, 1.08384, 0.342105], [1.18777, 1.08384, 0.350877], [1.23231, 1.08533, 0.364035], [1.26201, 1.08681, 0.372807], [1.2917, 1.0883, 0.381579], [1.3214, 1.0883, 0.390351], [1.35109, 1.08978, 0.399123], [1.38079, 1.08978, 0.407895], [1.42533, 1.09275, 0.421053], [1.45502, 1.09275, 0.429825], [1.48472, 1.09275, 0.438596], [1.51441, 1.09424, 0.447368], [1.5441, 1.09572, 0.45614], [1.5738, 1.09572, 0.464912], [1.60349, 1.09721, 0.473684], [1.64803, 1.09721, 0.486842], [1.67773, 1.10017, 0.495614], [1.70742, 1.10017, 0.504386], [1.73712, 1.10166, 0.513158], [1.76681, 1.10314, 0.52193], [1.79651, 1.10314, 0.530702], [1.84105, 1.10463, 0.54386], [1.87074, 1.10314, 0.552632], [1.90044, 1.10166, 0.561404], [1.93013, 1.10166, 0.570175], [1.95983, 1.10166, 0.578947], [1.98952, 1.09869, 0.587719], [2.01921, 1.09721, 0.596491], [2.06376, 1.09275, 0.609649], [2.09345, 1.09127, 0.618421], [2.12314, 1.08533, 0.627193], [2.15284, 1.0779, 0.635965], [2.18253, 1.07197, 0.644737], [2.21223, 1.06454, 0.653509], [2.25677, 1.04969, 0.666667], [2.28646, 1.03782, 0.675439], [2.31616, 1.02445, 0.684211], [2.34585, 1.01109, 0.692982], [2.37555, 0.99624, 0.701754], [2.40524, 0.9814, 0.710526], [2.43493, 0.96507, 0.719298], [2.47948, 0.93686, 0.732456], [2.50917, 0.92498, 0.741228], [2.53886, 0.92498, 0.75], [2.56856, 0.92943, 0.758772], [2.59825, 0.93686, 0.767544], [2.62795, 0.94131, 0.776316], [2.67249, 0.94725, 0.789474], [2.70218, 0.94576, 0.798246], [2.73188, 0.93686, 0.807018], [2.76157, 0.92201, 0.815789]], "cap": [[2.7615720524017466, 0.8943484716157205, 0.8157894736842105], [2.7865720524017465, 0.9220087336244541, 0.8257894736842105], [2.981572052401747, 0.9220087336244541, 0.871578947368421], [3.0115720524017466, 0.8851283842794759, 0.881578947368421]], "capBase": 2.7615720524017466, "capRadius": 0.9220087336244541, "lift": 0.74, "baseColor": [0.12, 0.075, 0.04], "capColor": [0.18, 0.06, 0.028], "labelY": [0.6384279475982533, 2.360698689956332], "provenance": { "method": "Rotational silhouette approximation and photographic front texture. Rear surfaces and opening mechanism are illustrative.", "approved3D": false, "smallSource": true } }, "herbal-jari-booti-oil": { "id": "herbal-jari-booti-oil", "type": "jar", "sourceCutout": "ref-herbal-jari-booti-oil-cutout.webp", "texture": "model-herbal-jari-booti-oil-atlas.jpg", "height": 3.4, "width": 2.4555555555555553, "body": [[0.05812, 0.02034, 0.017167], [0.08718, 0.21504, 0.025751], [0.13077, 0.66692, 0.038627], [0.15983, 0.85291, 0.04721], [0.18889, 0.95752, 0.055794], [0.23248, 1.02436, 0.06867], [0.26154, 1.04906, 0.077253], [0.2906, 1.06795, 0.085837], [0.31966, 1.08538, 0.094421], [0.36325, 1.09991, 0.107296], [0.39231, 1.10573, 0.11588], [0.42137, 1.11154, 0.124464], [0.46496, 1.11735, 0.137339], [0.49402, 1.1188, 0.145923], [0.52308, 1.1188, 0.154506], [0.56667, 1.1188, 0.167382], [0.59573, 1.1188, 0.175966], [0.62479, 1.1188, 0.184549], [0.66838, 1.1188, 0.197425], [0.69744, 1.1188, 0.206009], [0.7265, 1.1188, 0.214592], [0.77009, 1.1188, 0.227468], [0.79915, 1.1188, 0.236052], [0.82821, 1.1188, 0.244635], [0.85726, 1.1188, 0.253219], [0.90085, 1.1188, 0.266094], [0.92991, 1.1188, 0.274678], [0.95897, 1.1188, 0.283262], [1.00256, 1.1188, 0.296137], [1.03162, 1.1159, 0.304721], [1.06068, 1.11299, 0.313305], [1.10427, 1.11154, 0.32618], [1.13333, 1.11154, 0.334764], [1.16239, 1.11154, 0.343348], [1.20598, 1.11154, 0.356223], [1.23504, 1.11154, 0.364807], [1.2641, 1.11154, 0.373391], [1.29316, 1.11154, 0.381974], [1.33675, 1.11154, 0.39485], [1.36581, 1.11154, 0.403433], [1.39487, 1.11154, 0.412017], [1.43846, 1.11154, 0.424893], [1.46752, 1.11154, 0.433476], [1.49658, 1.11154, 0.44206], [1.54017, 1.11154, 0.454936], [1.56923, 1.11154, 0.463519], [1.59829, 1.11154, 0.472103], [1.64188, 1.11154, 0.484979], [1.67094, 1.11154, 0.493562], [1.7, 1.11154, 0.502146], [1.72906, 1.11154, 0.51073], [1.77265, 1.11154, 0.523605], [1.80171, 1.11154, 0.532189], [1.83077, 1.11154, 0.540773], [1.87436, 1.11154, 0.553648], [1.90342, 1.11154, 0.562232], [1.93248, 1.11154, 0.570815], [1.97607, 1.11154, 0.583691], [2.00513, 1.11154, 0.592275], [2.03419, 1.11154, 0.600858], [2.07778, 1.11154, 0.613734], [2.10684, 1.11154, 0.622318], [2.1359, 1.11154, 0.630901], [2.16496, 1.11154, 0.639485], [2.20855, 1.11009, 0.652361], [2.23761, 1.10718, 0.660944], [2.26667, 1.10137, 0.669528], [2.31026, 1.09265, 0.682403], [2.33932, 1.08538, 0.690987], [2.36838, 1.07667, 0.699571], [2.41197, 1.05632, 0.712446], [2.44103, 1.04034, 0.72103], [2.47009, 1.02291, 0.729614], [2.51368, 0.99239, 0.742489], [2.54274, 0.96624, 0.751073], [2.57179, 0.94154, 0.759657], [2.61538, 0.9241, 0.772532], [2.64444, 0.91974, 0.781116], [2.6735, 0.91684, 0.7897], [2.70256, 0.91538, 0.798283], [2.74615, 0.91538, 0.811159], [2.77521, 0.91538, 0.819742], [2.80427, 0.93718, 0.828326], [2.84786, 1.00692, 0.841202], [2.87692, 1.03889, 0.849785]], "cap": [[2.87692, 1.03889, 0.849785], [2.89145, 1.04761, 0.854077], [2.90598, 1.05342, 0.858369], [2.92051, 1.05632, 0.862661], [2.93504, 1.05923, 0.866953], [2.94957, 1.06068, 0.871245], [2.9641, 1.06068, 0.875536], [2.97863, 1.06068, 0.879828], [2.99316, 1.05923, 0.88412], [3.00769, 1.05778, 0.888412], [3.02222, 1.05632, 0.892704], [3.03675, 1.05487, 0.896996], [3.05128, 1.05342, 0.901288], [3.06581, 1.05342, 0.905579], [3.08034, 1.05342, 0.909871], [3.09487, 1.05342, 0.914163], [3.1094, 1.05197, 0.918455], [3.12393, 1.04761, 0.922747], [3.13846, 1.04034, 0.927039], [3.15299, 1.02726, 0.93133], [3.16752, 1.00692, 0.935622], [3.18205, 0.98077, 0.939914], [3.19658, 0.9459, 0.944206], [3.21111, 0.90085, 0.948498], [3.22564, 0.84274, 0.95279], [3.24017, 0.76282, 0.957082], [3.2547, 0.63932, 0.961373], [3.26923, 0.46786, 0.965665], [3.28376, 0.30949, 0.969957], [3.29829, 0.17, 0.974249], [3.31282, 0.05957, 0.978541]], "capBase": 2.876923076923077, "capRadius": 1.038888888888889, "lift": 0.71, "baseColor": [0.07, 0.06, 0.036], "capColor": [0.58, 0.45, 0.23], "labelY": [0.5521367521367522, 2.106837606837607], "provenance": { "method": "Rotational silhouette approximation and photographic front texture. Rear surfaces and opening mechanism are illustrative.", "approved3D": false, "smallSource": true } }, "majun-jalali": { "id": "majun-jalali", "type": "jar", "sourceCutout": "ref-majun-jalali-cutout.webp", "texture": "model-majun-jalali-atlas.jpg", "height": 3.4, "width": 2.5293800539083557, "body": [[0.02291, 0.06461, 0.006748], [0.05499, 0.76615, 0.016194], [0.08706, 0.98059, 0.025641], [0.11914, 1.07636, 0.035088], [0.1558, 1.12722, 0.045884], [0.18787, 1.15013, 0.055331], [0.21995, 1.16709, 0.064777], [0.25202, 1.18038, 0.074224], [0.2841, 1.19092, 0.083671], [0.31617, 1.19916, 0.093117], [0.34825, 1.20604, 0.102564], [0.38032, 1.21154, 0.112011], [0.41698, 1.21704, 0.122807], [0.44906, 1.22024, 0.132254], [0.48113, 1.22391, 0.1417], [0.51321, 1.22574, 0.151147], [0.54528, 1.22712, 0.160594], [0.57736, 1.23032, 0.17004], [0.60943, 1.23032, 0.179487], [0.64151, 1.23032, 0.188934], [0.67817, 1.23032, 0.19973], [0.71024, 1.23032, 0.209177], [0.74232, 1.22803, 0.218623], [0.77439, 1.22803, 0.22807], [0.80647, 1.22803, 0.237517], [0.83854, 1.22803, 0.246964], [0.87062, 1.22803, 0.25641], [0.90728, 1.22803, 0.267206], [0.93935, 1.22803, 0.276653], [0.97143, 1.22803, 0.2861], [1.0035, 1.22803, 0.295547], [1.03558, 1.22803, 0.304993], [1.06765, 1.22803, 0.31444], [1.09973, 1.22803, 0.323887], [1.13181, 1.22574, 0.333333], [1.16846, 1.22574, 0.34413], [1.20054, 1.22574, 0.353576], [1.23261, 1.22437, 0.363023], [1.26469, 1.22345, 0.37247], [1.29677, 1.22345, 0.381916], [1.32884, 1.22345, 0.391363], [1.36092, 1.22345, 0.40081], [1.39757, 1.22345, 0.411606], [1.42965, 1.22345, 0.421053], [1.46173, 1.22345, 0.430499], [1.4938, 1.22345, 0.439946], [1.52588, 1.22116, 0.449393], [1.55795, 1.22116, 0.458839], [1.59003, 1.22116, 0.468286], [1.6221, 1.22116, 0.477733], [1.65876, 1.22116, 0.488529], [1.69084, 1.22116, 0.497976], [1.72291, 1.22116, 0.507422], [1.75499, 1.22116, 0.516869], [1.78706, 1.22116, 0.526316], [1.81914, 1.22116, 0.535762], [1.85121, 1.22116, 0.545209], [1.88329, 1.22116, 0.554656], [1.91995, 1.21887, 0.565452], [1.95202, 1.21887, 0.574899], [1.9841, 1.21887, 0.584345], [2.01617, 1.21887, 0.593792], [2.04825, 1.21887, 0.603239], [2.08032, 1.21887, 0.612686], [2.1124, 1.21887, 0.622132], [2.14906, 1.21887, 0.632928], [2.18113, 1.21887, 0.642375], [2.21321, 1.21887, 0.651822], [2.24528, 1.21887, 0.661269], [2.27736, 1.21795, 0.670715], [2.30943, 1.21658, 0.680162], [2.34151, 1.21658, 0.689609], [2.37358, 1.21658, 0.699055], [2.41024, 1.21658, 0.709852], [2.44232, 1.21658, 0.719298], [2.47439, 1.21658, 0.728745], [2.50647, 1.21658, 0.738192], [2.53854, 1.21658, 0.747638], [2.57062, 1.2152, 0.757085], [2.6027, 1.2097, 0.766532], [2.63477, 1.19779, 0.775978], [2.67143, 1.16663, 0.786775], [2.7035, 1.13089, 0.796221], [2.73558, 1.12997, 0.805668], [2.76765, 1.13135, 0.815115]], "cap": [[2.76765, 1.13135, 0.815115], [2.78598, 1.15288, 0.820513], [2.80431, 1.18267, 0.825911], [2.82264, 1.2042, 0.831309], [2.84097, 1.21108, 0.836707], [2.85472, 1.2097, 0.840756], [2.87305, 1.20375, 0.846154], [2.89137, 1.18679, 0.851552], [2.9097, 1.15334, 0.85695], [2.92803, 1.14189, 0.862348], [2.94636, 1.14555, 0.867746], [2.96469, 1.14784, 0.873144], [2.98302, 1.15013, 0.878543], [2.99677, 1.15334, 0.882591], [3.01509, 1.15609, 0.887989], [3.03342, 1.1593, 0.893387], [3.05175, 1.16205, 0.898785], [3.07008, 1.16388, 0.904184], [3.08841, 1.16571, 0.909582], [3.10674, 1.16755, 0.91498], [3.12507, 1.16846, 0.920378], [3.1434, 1.16755, 0.925776], [3.15714, 1.1648, 0.929825], [3.17547, 1.16388, 0.935223], [3.1938, 1.16205, 0.940621], [3.21213, 1.15792, 0.946019], [3.23046, 1.1538, 0.951417], [3.24879, 1.14051, 0.956815], [3.26712, 1.10706, 0.962213], [3.28544, 1.0507, 0.967611], [3.29919, 0.9893, 0.97166], [3.31752, 0.87199, 0.977058], [3.33585, 0.69054, 0.982456], [3.35418, 0.3597, 0.987854], [3.37251, 0.01741, 0.993252]], "capBase": 2.7676549865229108, "capRadius": 1.1313477088948787, "lift": 0.76, "baseColor": [0.115, 0.055, 0.03], "capColor": [0.024, 0.026, 0.022], "labelY": [0.26118598382749325, 2.3598382749326148], "provenance": { "method": "Rotational silhouette approximation and photographic front texture. Rear surfaces and opening mechanism are illustrative.", "approved3D": false, "smallSource": false } }, "ras-e-faulad": { "id": "ras-e-faulad", "type": "dropper", "sourceCutout": "ref-ras-e-faulad-cutout.webp", "texture": "model-ras-e-faulad-atlas.jpg", "height": 3.4, "width": 1.1005424954792045, "body": [[0.03074, 0.02582, 0.009058], [0.05533, 0.25946, 0.016304], [0.07993, 0.40148, 0.023551], [0.10452, 0.44759, 0.030797], [0.12911, 0.47219, 0.038043], [0.15986, 0.48879, 0.047101], [0.18445, 0.49678, 0.054348], [0.20904, 0.50108, 0.061594], [0.23363, 0.50354, 0.068841], [0.25823, 0.50416, 0.076087], [0.28282, 0.50416, 0.083333], [0.30741, 0.50416, 0.09058], [0.33201, 0.50416, 0.097826], [0.36275, 0.50416, 0.106884], [0.38734, 0.50416, 0.11413], [0.41193, 0.50416, 0.121377], [0.43653, 0.50416, 0.128623], [0.46112, 0.50416, 0.13587], [0.48571, 0.50416, 0.143116], [0.51031, 0.50416, 0.150362], [0.5349, 0.50416, 0.157609], [0.56564, 0.50416, 0.166667], [0.59024, 0.50416, 0.173913], [0.61483, 0.50416, 0.181159], [0.63942, 0.50416, 0.188406], [0.66401, 0.50416, 0.195652], [0.68861, 0.50416, 0.202899], [0.7132, 0.50416, 0.210145], [0.73779, 0.50416, 0.217391], [0.76239, 0.50416, 0.224638], [0.79313, 0.50416, 0.233696], [0.81772, 0.50416, 0.240942], [0.84231, 0.50416, 0.248188], [0.86691, 0.50416, 0.255435], [0.8915, 0.50416, 0.262681], [0.91609, 0.50416, 0.269928], [0.94069, 0.50416, 0.277174], [0.96528, 0.50416, 0.28442], [0.99602, 0.50416, 0.293478], [1.02061, 0.50416, 0.300725], [1.04521, 0.50416, 0.307971], [1.0698, 0.50416, 0.315217], [1.09439, 0.50416, 0.322464], [1.11899, 0.50416, 0.32971], [1.14358, 0.50416, 0.336957], [1.16817, 0.50416, 0.344203], [1.19277, 0.50416, 0.351449], [1.22351, 0.50416, 0.360507], [1.2481, 0.50416, 0.367754], [1.27269, 0.50416, 0.375], [1.29729, 0.50416, 0.382246], [1.32188, 0.50416, 0.389493], [1.34647, 0.50416, 0.396739], [1.37107, 0.50416, 0.403986], [1.39566, 0.50416, 0.411232], [1.4264, 0.50416, 0.42029], [1.45099, 0.50416, 0.427536], [1.47559, 0.50416, 0.434783], [1.50018, 0.50416, 0.442029], [1.52477, 0.50416, 0.449275], [1.54937, 0.50416, 0.456522], [1.57396, 0.50416, 0.463768], [1.59855, 0.50416, 0.471014], [1.62315, 0.50416, 0.478261], [1.65389, 0.50354, 0.487319], [1.67848, 0.49986, 0.494565], [1.70307, 0.49494, 0.501812], [1.72767, 0.48756, 0.509058], [1.75226, 0.47772, 0.516304], [1.77685, 0.46542, 0.523551], [1.80145, 0.45005, 0.530797], [1.82604, 0.43161, 0.538043], [1.85678, 0.40271, 0.547101], [1.88137, 0.37935, 0.554348], [1.90597, 0.36521, 0.561594], [1.93056, 0.35967, 0.568841], [1.95515, 0.35967, 0.576087], [1.97975, 0.36152, 0.583333], [2.00434, 0.36275, 0.59058], [2.02893, 0.3609, 0.597826], [2.05967, 0.35967, 0.606884], [2.08427, 0.36213, 0.61413], [2.10886, 0.36152, 0.621377], [2.13345, 0.35783, 0.628623], [2.15805, 0.35353, 0.63587]], "cap": [[2.15805, 0.35353, 0.63587], [2.19494, 0.36275, 0.646739], [2.23183, 0.37382, 0.657609], [2.26257, 0.37013, 0.666667], [2.29946, 0.3689, 0.677536], [2.33635, 0.36767, 0.688406], [2.37324, 0.36582, 0.699275], [2.40398, 0.36336, 0.708333], [2.44087, 0.36152, 0.719203], [2.47776, 0.35967, 0.730072], [2.51465, 0.35967, 0.740942], [2.54539, 0.35599, 0.75], [2.58228, 0.35353, 0.76087], [2.61917, 0.3523, 0.771739], [2.65606, 0.31787, 0.782609], [2.6868, 0.23548, 0.791667], [2.72369, 0.21642, 0.802536], [2.76058, 0.20474, 0.813406], [2.79747, 0.19675, 0.824275], [2.83436, 0.19367, 0.835145], [2.8651, 0.19367, 0.844203], [2.90199, 0.19367, 0.855072], [2.93888, 0.19244, 0.865942], [2.97577, 0.1906, 0.876812], [3.00651, 0.1906, 0.88587], [3.0434, 0.1906, 0.896739], [3.08029, 0.1906, 0.907609], [3.11718, 0.1906, 0.918478], [3.14792, 0.1906, 0.927536], [3.18481, 0.1906, 0.938406], [3.2217, 0.18445, 0.949275], [3.25859, 0.174, 0.960145], [3.28933, 0.15924, 0.969203], [3.32622, 0.12235, 0.980072], [3.36311, 0.01107, 0.990942]], "capBase": 2.1580470162748644, "capRadius": 0.3535262206148282, "lift": 1, "baseColor": [0.2, 0.083, 0.027], "capColor": [0.025, 0.031, 0.027], "labelY": [0.3811934900542495, 1.616998191681736], "provenance": { "method": "Rotational silhouette approximation and photographic front texture. Rear surfaces and opening mechanism are illustrative.", "approved3D": false, "smallSource": false } }, "ras-e-jalali": { "id": "ras-e-jalali", "type": "bottle", "sourceCutout": "ref-ras-e-jalali-cutout.webp", "texture": "model-ras-e-jalali-atlas.jpg", "height": 3.4, "width": 1.3193324061196106, "body": [[0.02364, 0.04445, 0.006964], [0.05675, 0.42796, 0.016713], [0.08985, 0.53624, 0.026462], [0.12295, 0.57928, 0.036212], [0.15605, 0.60056, 0.045961], [0.18915, 0.61191, 0.05571], [0.22698, 0.62042, 0.066852], [0.26008, 0.62278, 0.076602], [0.29318, 0.6242, 0.086351], [0.32629, 0.6242, 0.0961], [0.35939, 0.6242, 0.10585], [0.39249, 0.6242, 0.115599], [0.42559, 0.6242, 0.125348], [0.45869, 0.6242, 0.135097], [0.49179, 0.6242, 0.144847], [0.5249, 0.6242, 0.154596], [0.558, 0.6242, 0.164345], [0.5911, 0.62373, 0.174095], [0.6242, 0.62184, 0.183844], [0.66203, 0.62184, 0.194986], [0.69513, 0.62184, 0.204735], [0.72823, 0.62184, 0.214485], [0.76134, 0.62184, 0.224234], [0.79444, 0.62184, 0.233983], [0.82754, 0.62184, 0.243733], [0.86064, 0.62184, 0.253482], [0.89374, 0.62184, 0.263231], [0.92684, 0.62184, 0.272981], [0.95994, 0.62184, 0.28273], [0.99305, 0.62184, 0.292479], [1.03088, 0.62184, 0.303621], [1.06398, 0.62184, 0.31337], [1.09708, 0.62184, 0.32312], [1.13018, 0.62184, 0.332869], [1.16328, 0.62184, 0.342618], [1.19638, 0.62184, 0.352368], [1.22949, 0.62184, 0.362117], [1.26259, 0.62184, 0.371866], [1.29569, 0.62184, 0.381616], [1.32879, 0.62184, 0.391365], [1.36189, 0.62184, 0.401114], [1.39499, 0.62184, 0.410864], [1.42809, 0.62184, 0.420613], [1.46592, 0.61994, 0.431755], [1.49903, 0.61947, 0.441504], [1.53213, 0.61947, 0.451253], [1.56523, 0.61947, 0.461003], [1.59833, 0.61947, 0.470752], [1.63143, 0.61947, 0.480501], [1.66453, 0.61947, 0.490251], [1.69764, 0.61947, 0.5], [1.73074, 0.61947, 0.509749], [1.76384, 0.61947, 0.519499], [1.79694, 0.61947, 0.529248], [1.83477, 0.61947, 0.54039], [1.86787, 0.61947, 0.550139], [1.90097, 0.61947, 0.559889], [1.93408, 0.61947, 0.569638], [1.96718, 0.61947, 0.579387], [2.00028, 0.61947, 0.589136], [2.03338, 0.61947, 0.598886], [2.06648, 0.61711, 0.608635], [2.09958, 0.61238, 0.618384], [2.13268, 0.60434, 0.628134], [2.16579, 0.59204, 0.637883], [2.19889, 0.57549, 0.647632], [2.23199, 0.55469, 0.657382], [2.26982, 0.52442, 0.668524], [2.30292, 0.49227, 0.678273], [2.33602, 0.45255, 0.688022], [2.36912, 0.40573, 0.697772], [2.40223, 0.3627, 0.707521], [2.43533, 0.32771, 0.71727], [2.46843, 0.31163, 0.727019], [2.50153, 0.30832, 0.736769], [2.53463, 0.30974, 0.746518], [2.56773, 0.30974, 0.756267], [2.60083, 0.30737, 0.766017], [2.63866, 0.30501, 0.777159], [2.67177, 0.30501, 0.786908], [2.70487, 0.30501, 0.796657], [2.73797, 0.30501, 0.806407], [2.77107, 0.30595, 0.816156], [2.80417, 0.32345, 0.825905], [2.83727, 0.33622, 0.835655]], "cap": [[2.83727, 0.33622, 0.835655], [2.85146, 0.3348, 0.839833], [2.87038, 0.33149, 0.845404], [2.88456, 0.32818, 0.849582], [2.89875, 0.32865, 0.85376], [2.91766, 0.33291, 0.859331], [2.93185, 0.3348, 0.86351], [2.94604, 0.33764, 0.867688], [2.96495, 0.34142, 0.873259], [2.97914, 0.34473, 0.877437], [2.99332, 0.34898, 0.881616], [3.01224, 0.35371, 0.887187], [3.02643, 0.35466, 0.891365], [3.04061, 0.3575, 0.895543], [3.05953, 0.35939, 0.901114], [3.07371, 0.35939, 0.905292], [3.0879, 0.35939, 0.909471], [3.10209, 0.35939, 0.913649], [3.121, 0.35939, 0.91922], [3.13519, 0.35939, 0.923398], [3.14937, 0.35939, 0.927577], [3.16829, 0.35939, 0.933148], [3.18248, 0.35939, 0.937326], [3.19666, 0.35844, 0.941504], [3.21558, 0.35608, 0.947075], [3.22976, 0.35135, 0.951253], [3.24395, 0.34567, 0.955432], [3.26287, 0.33196, 0.961003], [3.27705, 0.31919, 0.965181], [3.29124, 0.3017, 0.969359], [3.31015, 0.27049, 0.97493], [3.32434, 0.2388, 0.979109], [3.33853, 0.1953, 0.983287], [3.35744, 0.09032, 0.988858], [3.37163, 0.01088, 0.993036]], "capBase": 2.8372739916550764, "capRadius": 0.3362169680111266, "lift": 0.87, "baseColor": [0.19, 0.075, 0.025], "capColor": [0.025, 0.03, 0.027], "labelY": [0.43504867872044506, 1.9340751043115438], "provenance": { "method": "Rotational silhouette approximation and photographic front texture. Rear surfaces and opening mechanism are illustrative.", "approved3D": false, "smallSource": false } } };
/** Native WebGL 2: photographic UVs, moving geometry and studio-style lighting.
 * No network library, external font, CDN or generated product claim is required.
 * This is a visual mockup renderer, not a physically measured or ray-traced scan.
 */
const sVertex = `#version 300 es
precision highp float;
layout(location=0) in vec3 position;
layout(location=1) in vec3 normal;
layout(location=2) in vec2 uv;
uniform mat4 u_model;
uniform mat4 u_vp;
out vec3 v_world;
out vec3 v_normal;
out vec3 v_local;
out vec2 v_uv;
void main(){vec4 world=u_model*vec4(position,1.0);v_world=world.xyz;v_normal=mat3(u_model)*normal;v_local=position;v_uv=uv;gl_Position=u_vp*world;}`;
const sFragment = `#version 300 es
precision highp float;
uniform sampler2D u_texture;
uniform vec3 u_camera;
uniform vec3 u_color;
uniform int u_kind;
uniform vec2 u_label;
in vec3 v_world;
in vec3 v_normal;
in vec3 v_local;
in vec2 v_uv;
out vec4 fragColor;
float ggx(float n,float a){float aa=a*a;float d=n*n*(aa-1.0)+1.0;return aa/(3.14159265*d*d);}
vec3 light(vec3 n,vec3 v,vec3 l,vec3 col,float rough,vec3 f0){vec3 h=normalize(v+l);float nv=max(dot(n,v),0.001),nl=max(dot(n,l),0.0),nh=max(dot(n,h),0.0),vh=max(dot(v,h),0.0);float a=rough*rough,k=(rough+1.0)*(rough+1.0)/8.0;float g=(nv/(nv*(1.0-k)+k))*(nl/(nl*(1.0-k)+k));vec3 f=f0+(1.0-f0)*pow(1.0-vh,5.0);return col*(ggx(nh,a)*g*f/(4.0*nv*max(nl,0.001)))*nl;}
void main(){
 vec3 n=normalize(v_normal),v=normalize(u_camera-v_world);
 vec3 tex=u_kind<2?texture(u_texture,v_uv).rgb:u_color;
 vec3 base=pow(max(tex,vec3(0.001)),vec3(2.2));
 float facing=cos((v_uv.x*2.0-1.0)*3.14159265);
 float isPaper=(u_kind==0&&v_local.y>u_label.x&&v_local.y<u_label.y&&facing>0.18&&dot(tex,vec3(.333))>.36)?1.0:0.0;
 float rough=mix(u_kind==1?.33:.22,.68,isPaper);
 vec3 f0=u_kind==3?vec3(.28,.20,.10):vec3(.045);
 vec3 l1=normalize(vec3(-3.0,4.0,4.0)-v_world),l2=normalize(vec3(3.0,2.5,1.0)-v_world);
 float diffuse=.64+.29*max(dot(n,l1),0.0)+.11*max(dot(n,l2),0.0);
 vec3 color=base*diffuse;
 vec3 spec=light(n,v,l1,vec3(1.25,1.15,1.0),rough,f0)+light(n,v,l2,vec3(.8,.85,.94),rough,f0);
 vec3 r=reflect(-v,n);
 float strip=exp(-pow((r.x+.62)*10.0,2.0))*smoothstep(-.55,-.2,r.z)*smoothstep(-.5,.2,r.y);
 float edge=pow(1.0-max(dot(n,v),0.0),3.0);
 color+=spec*(1.0-isPaper*.87)+vec3(.16,.15,.125)*strip*(1.0-isPaper)*(.6+edge);
 if(u_kind==4)color=base*.38;
 color=color/(1.0+max(vec3(0.0),color-1.0)*.45);
 fragColor=vec4(pow(max(color,0.0),vec3(1.0/2.2)),1.0);
}`;
class SpatialRenderer {
    constructor(canvas, config) {
        this.canvas = canvas;
        this.config = config;
        this.meshes = [];
        this.uniforms = {};
        this.destroyed = false;
        this.camera = [0, 2.1, 8];
        this.loaded = false;
        this.drawCount = 0;
        const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: 'low-power', preserveDrawingBuffer: true });
        if (!gl)
            throw new Error('WebGL 2 is not available');
        this.gl = gl;
        const shader = (type, code) => { const s = gl.createShader(type); if (!s)
            throw new Error('Shader allocation failed'); gl.shaderSource(s, code); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            const why = gl.getShaderInfoLog(s) || 'Shader compile failed';
            gl.deleteShader(s);
            throw new Error(why);
        } return s; };
        const vs = shader(gl.VERTEX_SHADER, sVertex), fs = shader(gl.FRAGMENT_SHADER, sFragment);
        const program = gl.createProgram();
        if (!program)
            throw new Error('Program allocation failed');
        this.program = program;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS))
            throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed');
        for (const name of ['model', 'vp', 'texture', 'camera', 'color', 'kind', 'label'])
            this.uniforms[name] = gl.getUniformLocation(program, 'u_' + name);
        const texture = gl.createTexture();
        if (!texture)
            throw new Error('Texture allocation failed');
        this.texture = texture;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([80, 43, 19, 255]));
        this.add(sLathe(config.body), 0, false, config.baseColor);
        this.add(sLathe(config.cap), 1, true, config.capColor);
        const top = config.cap[config.cap.length - 1][0], topR = Math.max(.06, config.cap[config.cap.length - 2][1]);
        this.add(sDisc(topR, top, 1), 2, true, config.capColor);
        this.add(sDisc(config.capRadius, config.capBase, -1), 2, true, config.capColor);
        const neckR = config.capRadius * (config.type === 'jar' ? .87 : .81), neckTop = config.capBase + .07;
        this.add(sLathe([[config.capBase - .13, neckR, 0], [neckTop, neckR, 0]]), 2, false, config.baseColor);
        this.add(sDisc(neckR, neckTop, 1, neckR * .79), 3, false, [.25, .13, .049]);
        this.add(sDisc(neckR * .8, neckTop - .035, 1), 4, false, [.038, .022, .012]);
        const low = config.body[0];
        this.add(sDisc(low[1], low[0], -1), 2, false, config.baseColor);
        if (config.type === 'dropper') {
            this.add(sLathe([[config.capBase - .64, .017, 0], [config.capBase - .61, .033, 0], [config.capBase - .04, .033, 0], [config.capBase, .038, 0]]), 3, true, [.5, .43, .28]);
            this.add(sDisc(.033, config.capBase - .62, -1), 2, true, [.36, .27, .15]);
        }
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.clearColor(0, 0, 0, 0);
    }
    add(data, kind, moving, color) {
        const gl = this.gl, vao = gl.createVertexArray(), buffer = gl.createBuffer(), index = gl.createBuffer();
        if (!vao || !buffer || !index)
            throw new Error('Mesh allocation failed');
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, data.vertices, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
        gl.enableVertexAttribArray(1);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 32, 12);
        gl.enableVertexAttribArray(2);
        gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 32, 24);
        this.meshes.push({ vao, buffer, index, count: data.indices.length, kind, moving, color });
    }
    async load(src) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.decoding = 'async';
        image.src = src;
        await image.decode();
        if (this.destroyed)
            return;
        const gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.loaded = true;
    }
    draw(rotation, opening) {
        if (this.destroyed || !this.loaded)
            return;
        const gl = this.gl, rect = this.canvas.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1)
            return;
        const dpr = Math.min(devicePixelRatio || 1, innerWidth < 760 ? 1.5 : 2), width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
        gl.viewport(0, 0, width, height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.useProgram(this.program);
        const aspect = width / height;
        const distance = Math.max(9.0, (this.config.width + 1.3) / (Math.tan(.58 / 2) * aspect * 2));
        this.camera = [0, 2.65, distance];
        const vp = smMultiply(smPerspective(.58, aspect, .1, 30), smLookAt(this.camera, [0, 2.08, 0]));
        gl.uniformMatrix4fv(this.uniforms.vp, false, vp);
        gl.uniform3fv(this.uniforms.camera, this.camera);
        gl.uniform2fv(this.uniforms.label, this.config.labelY);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.uniform1i(this.uniforms.texture, 0);
        const body = smRotateY(rotation), cap = smMultiply(body, smMultiply(smTranslate(0, this.config.lift * opening, 0), smRotateY(-opening * Math.PI * 3.2)));
        for (const mesh of this.meshes) {
            gl.bindVertexArray(mesh.vao);
            gl.uniformMatrix4fv(this.uniforms.model, false, mesh.moving ? cap : body);
            gl.uniform1i(this.uniforms.kind, mesh.kind);
            gl.uniform3fv(this.uniforms.color, mesh.color);
            gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
        }
        this.drawCount++;
    }
    dispose() { if (this.destroyed)
        return; this.destroyed = true; const gl = this.gl; for (const m of this.meshes) {
        gl.deleteVertexArray(m.vao);
        gl.deleteBuffer(m.buffer);
        gl.deleteBuffer(m.index);
    } gl.deleteTexture(this.texture); gl.deleteProgram(this.program); gl.getExtension('WEBGL_lose_context')?.loseContext(); }
}
