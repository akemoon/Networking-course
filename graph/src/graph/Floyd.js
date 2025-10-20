export function Floyd(weightMatrix) {
    const w = weightMatrix;
    const n = w.length;

    // Form matrix of prev vertices for v_j in path from v_i to v_j
    const prev = [];
    for (let i = 0; i < n; i++) {
        prev[i] = [];
        for (let j = 0; j < n; j++) {
            prev[i][j] = i;
        }
    }

    // Update weights
    // i --> k --> j
    for (let k = 0; k < n; k++) {
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                if (w[i][k] !== Infinity && w[k][j] !== Infinity) {
                    const new_w = w[i][k] + w[k][j];
                    if (w[i][j] > new_w) {
                        w[i][j] = new_w;
                        prev[i][j] = prev[k][j];
                    }
                }
            }
        }
        // Check for negative cycles
        for (let i = 0; i < n; i++) {
            if (w[i][i] < 0) {
                return null;
            }
        }
    }

    // Build paths
    const paths = new Map();
    for (let i = 0; i < n; i++) {
        let js = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                continue;
            } else if (w[i][j] === Infinity) {
                js.push({to: j, path: null, weight: Infinity});
            } else {
                let p = [j];
                let k = j;
                while (k !== i) {
                    k = prev[i][k];
                    p.push(k);
                }
                p.reverse();
                js.push({to: j, path: p, weight: w[i][j]});
            }
        }
        paths.set(i, js);
    }

    return paths;
}
