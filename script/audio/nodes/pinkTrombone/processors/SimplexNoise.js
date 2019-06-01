// VECTOR 3

function Vector3(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
}

Object.defineProperties(Vector3.prototype, {
    dot2 : {
        value : function(x, y) {
            return (this.x*x) + (this.y*y);
        }
    },
    dot3 : {
        value : function(x, y, z) {
            return this.dot2(x, y) + (this.z*z);
        }
    }
});

//////////////////////////////////////////////////////////////////////

// SIMPLEX NOISE

function SimplexNoise() {
    this.grad3 = [
        [+1, +1, +0],
        [-1, +1, +0],
        [+1, -1, +0],
        [-1, -1, +0],
        [+1, +0, +1],
        [-1, +0, +1],
        [+1, +0, -1],
        [-1, +0, -1],
        [+0, +1, +1],
        [+0, -1, +1],
        [+0, +1, -1],
        [+0, -1, -1],
    ].map(vector3Arguments => new Vector3(...vector3Arguments));

    this.p = [151,160,137,91,90,15,
        131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
        190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
        88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,
        77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
        102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,
        135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,
        5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
        223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,
        129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,
        251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,
        49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,
        138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    
    this.perm = new Array(Math.pow(2, 8+1));
    this.gradP = new Array(Math.pow(2, 8+1));

    this.F2 = (0.5 * (Math.sqrt(3) - 1));
    this.G2 = ((3 - Math.sqrt(3))/6);

    this.F3 = (1/3);
    this.G3 = (1/6);

    this.seed(Date.now());
}

Object.defineProperties(SimplexNoise.prototype, {
    seed : {
        value : function(seed) {
            if((seed > 0) && (seed < 1))
                seed *= Math.pow(2, 16);
            
            seed = Math.floor(seed);
    
            if(seed < Math.pow(2, 8))
                seed |= seed << Math.pow(2, 3);
            
            for(let index = 0; index < Math.pow(2, 8); index++) {
                const seedShift = (index & 1)?
                    0 :
                    Math.pow(2, 3);
    
                const value = this.p[index] ^ ((seed >> seedShift) & (Math.pow(2, 8)-1));
                
                this.perm[index] = this.perm[index + Math.pow(2, 8)] = value;
                this.gradP[index] = this.gradP[index + Math.pow(2, 8)] = this.grad3[value % this.grad3.length];
            }
        }
    },
    simplex2 : {
        value : function(xin, yin) {
            const s = ((xin + yin) * this.F2);
            
            var i = Math.floor(xin + s);
            var j = Math.floor(yin + s);
            
            const t = (i + j) * this.G2;
            
            const x0 = xin - i + t;
            const y0 = yin - j + t;
            
            const i1 = (x0 > y0)? 1:0;
            const j1 = 1 - i1;
    
            const x1 = x0 - i1 + this.G2;
            const y1 = y0 - j1 + this.G2;
    
            const x2 = (x0 - 1) + (2 * this.G2);
            const y2 = (y0 - 1) + (2 * this.G2);
    
            i &= (Math.pow(2, 8)-1);
            j &= (Math.pow(2, 8)-1);
    
            const gi0 = this.gradP[i + this.perm[j]];
            const gi1 = this.gradP[i + i1 + this.perm[j + j1]];
            const gi2 = this.gradP[i + 1 + this.perm[j + 1]];
    
            const t0 = 0.5 - Math.pow(x0, 2) - Math.pow(y0, 2);
            const n0 = (t0 < 0)?
                0 :
                Math.pow(t0, 4) * gi0.dot2(x0, y0);
    
            const t1 = 0.5 - Math.pow(x1, 2) - Math.pow(y1, 2);
            const n1 = (t1 < 0)?
                0 :
                Math.pow(t1, 4) * gi1.dot2(x1, y1);
    
            const t2 = 0.5 - Math.pow(x2, 2) - Math.pow(y2, 2);
            const n2 = (t2 < 0)?
                0 :
                Math.pow(t2, 4) * gi2.dot2(x2, y2);
    
            return 70 * (n0 + n1 + n2);
        }
    },
    simplex1 : {
        value : function(x) {
            return this.simplex2((x * 1.2), -(x * 0.7));
        }
    }
});

export default SimplexNoise;