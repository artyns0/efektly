import * as THREE from "three";
import type { ElasticBubble3DSettings } from "../../types/three";

/* ------------------------------------------------------------------ */
/*  Elastic Bubble 3D — a subdivided icosphere mesh deformed in the     */
/*  vertex shader by animated simplex noise (turbulence + elastic       */
/*  wobble + wind bias). The fragment shader fakes a glossy, iridescent  */
/*  bubble membrane: fresnel, specular gloss, rim light, a cosine        */
/*  iridescence palette and view-dependent alpha. All real-time.        */
/* ------------------------------------------------------------------ */

const col = (hex: string) => new THREE.Color(hex);

/* Ashima 3D simplex noise (public domain) used for surface displacement. */
const SNOISE = /* glsl */ `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+1.0*C.xxx; vec3 x2=x0-i2+2.0*C.xxx; vec3 x3=x0-1.0+3.0*C.xxx;
  i=mod(i,289.0);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=1.0/7.0; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERT = /* glsl */ `
uniform float uTime, uNoiseScale, uTurb, uFlow, uDrift, uWobbleAmp, uWobbleFreq;
uniform float uGust, uBlob, uDeform;
uniform vec3 uWind;
varying vec3 vWorldPos; varying vec3 vNormal;
${SNOISE}
vec3 displace(vec3 p){
  vec3 dir = normalize(p);
  float t = uTime;
  float n = 0.0;
  n += snoise(p*uNoiseScale + vec3(0.0, t*0.3*uFlow, 0.0))*0.6;
  n += snoise(p*uNoiseScale*2.1 + vec3(t*0.25*uFlow))*0.3;
  n += snoise(p*uNoiseScale*4.3 - vec3(0.0,0.0,t*0.2*uFlow))*0.15;
  float wob = sin(t*uWobbleFreq + dir.y*3.0)*0.5 + sin(t*uWobbleFreq*0.7 + dir.x*2.2)*0.5;
  float windBias = dot(dir, uWind) * (1.0 + sin(t*1.3)*uGust);
  float disp = (n*uTurb + wob*uWobbleAmp + windBias) * uBlob * uDeform;
  vec3 driftv = vec3(sin(t*0.4), cos(t*0.33), sin(t*0.27))*uDrift;
  return p + dir*disp + driftv;
}
void main(){
  vec3 n0 = normalize(position);
  vec3 t1 = normalize(cross(n0, vec3(0.0,1.0,0.0)+vec3(0.0001,0.0,0.0)));
  vec3 t2 = normalize(cross(n0, t1));
  float e = 0.02;
  vec3 P  = displace(position);
  vec3 Pa = displace(position + t1*e);
  vec3 Pb = displace(position + t2*e);
  vec3 nrm = normalize(cross(Pa-P, Pb-P));
  if(dot(nrm,n0)<0.0) nrm = -nrm;
  vNormal = normalMatrix * nrm;
  vec4 wp = modelMatrix * vec4(P,1.0);
  vWorldPos = wp.xyz;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
precision highp float;
uniform vec3 uBase, uHighlight, uShadow, uEmissive, uLightPos;
uniform float uFresnel, uChroma, uColorShift, uGloss, uReflect, uRim, uOpacity, uLightInt, uTime, uRefract;
varying vec3 vWorldPos; varying vec3 vNormal;
vec3 pal(float t){ return 0.5 + 0.5*cos(6.28318*(vec3(0.0,0.33,0.67)+t)); }
void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPos);
  vec3 L = normalize(uLightPos - vWorldPos);
  float ndv = max(dot(N,V),0.0);
  float ndl = max(dot(N,L),0.0);
  float fres = pow(1.0-ndv, mix(1.0,5.0,uFresnel));
  vec3 base = mix(uShadow, uBase, ndl*0.85+0.15);
  base = mix(base, uHighlight, fres*0.6);
  vec3 irid = pal(fres*1.5 + uColorShift + ndv*0.5 + uRefract*0.3 + uTime*0.02);
  vec3 color = mix(base, irid, uChroma);
  vec3 H = normalize(L+V);
  float spec = pow(max(dot(N,H),0.0), 16.0 + uGloss*180.0) * uReflect;
  float rim = pow(1.0-ndv, 2.0) * uRim;
  color += spec*uHighlight + rim*uHighlight*0.6;
  color += uEmissive;
  color *= uLightInt;
  float alpha = mix(uOpacity, 1.0, fres) - uRefract*0.12*(1.0-fres);
  gl_FragColor = vec4(color, clamp(alpha,0.0,1.0));
}`;

export class ElasticBubble {
  readonly mesh: THREE.Mesh;
  private geometry: THREE.IcosahedronGeometry;
  private material: THREE.ShaderMaterial;
  private detail = -1;

  constructor() {
    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
        uNoiseScale: { value: 1.5 }, uTurb: { value: 0.3 }, uFlow: { value: 1 },
        uDrift: { value: 0.1 }, uWobbleAmp: { value: 0.2 }, uWobbleFreq: { value: 1 },
        uGust: { value: 0.3 }, uBlob: { value: 1 }, uDeform: { value: 1 },
        uWind: { value: new THREE.Vector3() },
        uBase: { value: col("#5B7CFF") }, uHighlight: { value: col("#FFE9F5") },
        uShadow: { value: col("#0A0620") }, uEmissive: { value: col("#140A2E") },
        uLightPos: { value: new THREE.Vector3(4, 6, 5) },
        uFresnel: { value: 0.55 }, uChroma: { value: 0.55 }, uColorShift: { value: 0.45 },
        uGloss: { value: 0.65 }, uReflect: { value: 0.55 }, uRim: { value: 0.5 },
        uOpacity: { value: 1 }, uLightInt: { value: 1 }, uRefract: { value: 0.4 },
      },
    });
    this.geometry = new THREE.IcosahedronGeometry(1, 5);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
  }

  /** Apply settings; rebuild geometry only when subdivision changes. */
  sync(s: ElasticBubble3DSettings): void {
    const detail = 3 + Math.round((s.surfaceSmoothness / 100) * 3); // 3..6
    if (detail !== this.detail) {
      this.detail = detail;
      this.geometry.dispose();
      this.geometry = new THREE.IcosahedronGeometry(1, detail);
      this.mesh.geometry = this.geometry;
    }

    const size = 0.6 + (s.size / 100) * 1.4;
    this.mesh.scale.set(
      size * (s.stretchX / 100),
      size * (s.stretchY / 100),
      size * (s.stretchZ / 100),
    );

    const u = this.material.uniforms;
    u.uNoiseScale.value = 0.6 + (s.noiseScale / 100) * 3.2;
    u.uTurb.value = (s.turbulence / 100) * 0.5 * (1 - (s.damping / 100) * 0.4);
    u.uFlow.value = (s.flow / 100) * 1.6;
    u.uDrift.value = (s.drift / 100) * 0.14;
    u.uWobbleAmp.value = (s.elasticity / 100) * 0.35 * (0.4 + s.softness / 100);
    u.uWobbleFreq.value = 0.4 + (s.recovery / 100) * 2.6;
    u.uGust.value = (s.gust / 100) * 0.5;
    u.uBlob.value = 0.35 + (s.blobStrength / 100) * 1.2;
    u.uDeform.value = 0.25 + (1 - s.roundness / 100) * 1.1;

    const wind = new THREE.Vector3(s.windX, s.windY, s.windZ);
    if (wind.lengthSq() > 0) wind.normalize();
    wind.multiplyScalar((s.windStrength / 100) * 0.5);
    (u.uWind.value as THREE.Vector3).copy(wind);

    (u.uBase.value as THREE.Color).set(s.baseColor);
    (u.uHighlight.value as THREE.Color).set(s.highlightColor);
    (u.uShadow.value as THREE.Color).set(s.shadowTint);
    (u.uEmissive.value as THREE.Color).set(s.emissiveTint);
    u.uFresnel.value = s.fresnel / 100;
    u.uChroma.value = s.chromatic / 100;
    u.uColorShift.value = s.colorShift / 100;
    u.uGloss.value = s.gloss / 100;
    u.uReflect.value = (s.reflectivity / 100) * 1.4;
    u.uRim.value = (s.rimLight / 100) * 1.2;
    u.uOpacity.value = s.opacity / 100;
    u.uRefract.value = s.refraction / 100;
    u.uLightInt.value = 0.45 + (s.lightIntensity / 100) * 1.1;
    (u.uLightPos.value as THREE.Vector3).set(
      s.lightX / 10, s.lightY / 10, s.lightZ / 10,
    );
    this.material.transparent = s.opacity < 100 || s.refraction > 0;
  }

  private clock = 0;

  /** Per-frame: advance motion time (paused when Auto Motion is off) + rotation. */
  tick(_time: number, dt: number, s: ElasticBubble3DSettings): void {
    // Loop duration scales the motion rate so a full cycle takes ~loop seconds.
    const rate = s.autoMotion ? s.speed * (6 / Math.max(0.5, s.loopDuration)) : 0;
    this.clock += dt * rate;
    this.material.uniforms.uTime.value = this.clock;

    const DEG = Math.PI / 180;
    this.mesh.rotation.x = s.rotateX * DEG;
    this.mesh.rotation.z = s.rotateZ * DEG;
    this.mesh.rotation.y = s.autoRotate
      ? this.mesh.rotation.y + dt * (s.autoMotion ? s.speed : 1) * 0.25
      : s.rotateY * DEG;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}
