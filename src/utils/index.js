import THREE from '../three';

export function prettyPrintMatrix(uglymatrix) {
  for (let s = 0; s < 4; s += 1) {
    const quartet = [uglymatrix[s],
      uglymatrix[s + 4],
      uglymatrix[s + 8],
      uglymatrix[s + 12]];
    console.log(quartet.map((num) => { return num.toFixed(4); })); // eslint-disable-line
  }
}

export function makePerspectiveMatrix(fovy, aspect, near, far) {
  const out = new THREE.Matrix4();
  const f = 1.0 / Math.tan(fovy / 2);
  const nf = 1 / (near - far);
  out.elements[0] = f / aspect;
  out.elements[1] = 0;
  out.elements[2] = 0;
  out.elements[3] = 0;
  out.elements[4] = 0;
  out.elements[5] = f;
  out.elements[6] = 0;
  out.elements[7] = 0;
  out.elements[8] = 0;
  out.elements[9] = 0;
  out.elements[10] = (far + near) * nf;
  out.elements[11] = -1;
  out.elements[12] = 0;
  out.elements[13] = 0;
  out.elements[14] = (2 * far * near) * nf;
  out.elements[15] = 0;
  return out;
}

// gimme radians
export function radify(deg) {
  if (typeof deg === 'object') {
    return deg.map((degree) => {
      return Math.PI * 2 * degree / 360;
    });
  }

  return Math.PI * 2 * deg / 360;
}

// gimme degrees
export function degreeify(rad) {
  return 360 * rad / (Math.PI * 2);
}
