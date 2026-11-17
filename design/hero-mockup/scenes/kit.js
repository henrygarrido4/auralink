/**
 * Shared helpers for the hero mockup scenes (products.html, devices.html).
 * Runs in the browser; three.js comes from the import map in each page.
 * Units are centimetres, y is up, and the floor is y = 0.
 */
import * as THREE from 'three';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { HorizontalBlurShader } from 'three/addons/shaders/HorizontalBlurShader.js';
import { VerticalBlurShader } from 'three/addons/shaders/VerticalBlurShader.js';

/** Output size from the page's query string (`?w=2000&h=1400`), with defaults. */
export function readSize(width, height) {
  const params = new URLSearchParams(location.search);
  return {
    width: Number(params.get('w')) || width,
    height: Number(params.get('h')) || height,
  };
}

/** A renderer sized in real pixels, sRGB output, neutral tone mapping, soft (VSM) shadows. */
export function createRenderer({ width, height, transparent = false }) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: transparent,
    preserveDrawingBuffer: true,
  });
  renderer.setPixelRatio(1);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  if (transparent) renderer.setClearColor(0x000000, 0);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

/** Studio reflections: three.js's neutral room, prefiltered for physically based materials. */
export function roomEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

/** A rectangle with circular corners, centred on the origin, in the XY plane. */
export function roundedRectShape(width, height, radius) {
  const x = -width / 2;
  const y = -height / 2;
  const r = Math.min(radius, width / 2, height / 2);
  const shape = new THREE.Shape();
  shape.moveTo(x + r, y);
  shape.lineTo(x + width - r, y);
  shape.absarc(x + width - r, y + r, r, -Math.PI / 2, 0, false);
  shape.lineTo(x + width, y + height - r);
  shape.absarc(x + width - r, y + height - r, r, 0, Math.PI / 2, false);
  shape.lineTo(x + r, y + height);
  shape.absarc(x + r, y + height - r, r, Math.PI / 2, Math.PI, false);
  shape.lineTo(x, y + r);
  shape.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return shape;
}

/**
 * A slab with rounded corners and filleted edges: `width` x `height` in the XY plane, `depth`
 * along Z, centred on the origin, outer dimensions exact. Normals are smoothed across the fillets.
 */
export function roundedSlab({ width, height, depth, radius, fillet, curveSegments = 48 }) {
  const shape = roundedRectShape(width - 2 * fillet, height - 2 * fillet, radius - fillet);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: depth - 2 * fillet,
    bevelEnabled: true,
    bevelThickness: fillet,
    bevelSize: fillet,
    bevelSegments: 6,
    curveSegments,
  });
  geometry.translate(0, 0, -(depth - 2 * fillet) / 2);
  geometry.deleteAttribute('uv');
  geometry.deleteAttribute('normal');
  const smooth = mergeVertices(geometry, 1e-4);
  smooth.computeVertexNormals();
  return smooth;
}

/** A flat rounded rectangle in the XY plane whose UVs span 0..1 across its bounds. */
export function roundedPlane(width, height, radius, curveSegments = 32) {
  const geometry = new THREE.ShapeGeometry(roundedRectShape(width, height, radius), curveSegments);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i += 1) {
    uv.setXY(i, position.getX(i) / width + 0.5, position.getY(i) / height + 0.5);
  }
  return geometry;
}

/** Loads an image as an sRGB texture with mipmaps and full anisotropic filtering. */
export function loadTexture(renderer, url) {
  return new Promise((resolve, reject) => {
    new THREE.TextureLoader().load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        resolve(texture);
      },
      undefined,
      reject,
    );
  });
}

/**
 * Contact shadows, after three.js's webgl_shadow_contact example: the scene is rendered from
 * below into a depth-to-alpha target, blurred, and laid on the floor as a transparent plane.
 * Call `update()` before each render of the main camera.
 */
export function contactShadow(
  renderer,
  scene,
  { size, resolution = 1024, height, darkness, blur },
) {
  const group = new THREE.Group();
  group.position.y = 0.001;
  scene.add(group);

  const target = new THREE.WebGLRenderTarget(resolution, resolution);
  const blurTarget = new THREE.WebGLRenderTarget(resolution, resolution);
  target.texture.generateMipmaps = false;
  blurTarget.texture.generateMipmaps = false;

  const planeGeometry = new THREE.PlaneGeometry(size, size).rotateX(Math.PI / 2);
  const plane = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshBasicMaterial({ map: target.texture, transparent: true, depthWrite: false }),
  );
  plane.renderOrder = 1;
  // Flipped so it faces up to the main camera and away from the shadow camera.
  plane.scale.y = -1;
  group.add(plane);

  const blurPlane = new THREE.Mesh(planeGeometry);
  blurPlane.visible = false;
  group.add(blurPlane);

  const camera = new THREE.OrthographicCamera(-size / 2, size / 2, size / 2, -size / 2, 0, height);
  camera.rotation.x = Math.PI / 2;
  // Just under the floor, so the undersides of objects resting on it are in front of the camera.
  camera.position.y = -0.05;
  group.add(camera);

  const depthMaterial = new THREE.MeshDepthMaterial();
  depthMaterial.userData.darkness = { value: darkness };
  depthMaterial.onBeforeCompile = (shader) => {
    shader.uniforms.darkness = depthMaterial.userData.darkness;
    shader.fragmentShader = `uniform float darkness;\n${shader.fragmentShader.replace(
      'gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );',
      'gl_FragColor = vec4( vec3( 0.0 ), ( 1.0 - fragCoordZ ) * darkness );',
    )}`;
  };
  depthMaterial.depthTest = false;
  depthMaterial.depthWrite = false;

  const horizontal = new THREE.ShaderMaterial(HorizontalBlurShader);
  const vertical = new THREE.ShaderMaterial(VerticalBlurShader);
  horizontal.depthTest = false;
  vertical.depthTest = false;

  const blurPass = (amount) => {
    blurPlane.visible = true;
    blurPlane.material = horizontal;
    horizontal.uniforms.tDiffuse.value = target.texture;
    horizontal.uniforms.h.value = amount / 256;
    renderer.setRenderTarget(blurTarget);
    renderer.render(blurPlane, camera);
    blurPlane.material = vertical;
    vertical.uniforms.tDiffuse.value = blurTarget.texture;
    vertical.uniforms.v.value = amount / 256;
    renderer.setRenderTarget(target);
    renderer.render(blurPlane, camera);
    blurPlane.visible = false;
  };

  return {
    group,
    /** `hidden`: objects (other floor planes) that must not cast into the contact shadow. */
    update(hidden = []) {
      const background = scene.background;
      const clearAlpha = renderer.getClearAlpha();
      scene.background = null;
      hidden.forEach((object) => (object.visible = false));
      plane.visible = false;
      scene.overrideMaterial = depthMaterial;
      renderer.setClearAlpha(0);
      renderer.setRenderTarget(target);
      renderer.clear();
      renderer.render(scene, camera);
      scene.overrideMaterial = null;
      blurPass(blur);
      blurPass(blur * 0.4);
      renderer.setRenderTarget(null);
      renderer.setClearAlpha(clearAlpha);
      plane.visible = true;
      hidden.forEach((object) => (object.visible = true));
      scene.background = background;
    },
  };
}

/** Publishes the finished frame for render.mjs, which polls `window.__rendered`. */
export function publish(renderer) {
  window.__rendered = renderer.domElement.toDataURL('image/png');
}

/** Reports a failure to render.mjs instead of hanging until its timeout. */
export function publishError(error) {
  console.error(error);
  window.__renderError = String(error?.stack || error);
}
