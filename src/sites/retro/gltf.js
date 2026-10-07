// Minimal parser for the embedded-buffer glTF files in public/models.
// The models were exported from Blender with a single base64 buffer, so this
// avoids pulling in GLTFLoader for what is just meshes + PBR materials.

const modelCache = {};

export function fetchModels(url) {
    if (!modelCache[url]) {
        modelCache[url] = fetch(url).then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
            return res.json();
        });
        // Allow a retry on the next mount if the request failed.
        modelCache[url].catch(() => { delete modelCache[url]; });
    }
    return modelCache[url];
}

const COMPONENTS = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

function arrayType(componentType) {
    if (componentType === 5126) return Float32Array;
    if (componentType === 5125) return Uint32Array;
    if (componentType === 5123) return Uint16Array;
    return Uint8Array;
}

// keep(x) registers a geometry/material for disposal; defaultMaterial is used
// for primitives that have no material assigned.
export function buildGltf(T, gl, keep, defaultMaterial) {
    const uri = gl.buffers[0].uri;
    const bin = atob(uri.slice(uri.indexOf(',') + 1));
    const buf = new ArrayBuffer(bin.length);
    const u8 = new Uint8Array(buf);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);

    const accessor = (ix) => {
        const a = gl.accessors[ix];
        const bv = gl.bufferViews[a.bufferView];
        const C = arrayType(a.componentType);
        return new C(buf, (bv.byteOffset || 0) + (a.byteOffset || 0), a.count * COMPONENTS[a.type]);
    };

    const materials = (gl.materials || []).map((m) => {
        const pb = m.pbrMetallicRoughness || {};
        const c = pb.baseColorFactor || [1, 1, 1, 1];
        const mm = keep(new T.MeshStandardMaterial({
            roughness: pb.roughnessFactor == null ? 1 : pb.roughnessFactor,
            metalness: pb.metallicFactor == null ? 1 : pb.metallicFactor,
        }));
        mm.color.setRGB(c[0], c[1], c[2], T.LinearSRGBColorSpace);
        if (m.emissiveFactor) {
            mm.emissive.setRGB(m.emissiveFactor[0], m.emissiveFactor[1], m.emissiveFactor[2], T.LinearSRGBColorSpace);
            const ex = (m.extensions || {}).KHR_materials_emissive_strength;
            mm.emissiveIntensity = ex ? Math.min(ex.emissiveStrength, 3) : 1;
        }
        if (m.alphaMode === 'BLEND') {
            mm.transparent = true;
            mm.opacity = c[3];
            mm.depthWrite = false;
        }
        if (m.doubleSided) mm.side = T.DoubleSide;
        mm.name = m.name || '';
        mm.envMapIntensity = 1.1;
        return mm;
    });

    const meshes = gl.meshes.map((me) => me.primitives.map((pr) => {
        const g = keep(new T.BufferGeometry());
        g.setAttribute('position', new T.BufferAttribute(accessor(pr.attributes.POSITION), 3));
        if (pr.attributes.NORMAL != null) g.setAttribute('normal', new T.BufferAttribute(accessor(pr.attributes.NORMAL), 3));
        else g.computeVertexNormals();
        if (pr.attributes.TEXCOORD_0 != null) g.setAttribute('uv', new T.BufferAttribute(accessor(pr.attributes.TEXCOORD_0), 2));
        if (pr.indices != null) g.setIndex(new T.BufferAttribute(accessor(pr.indices), 1));
        return { g, m: pr.material != null ? materials[pr.material] : defaultMaterial };
    }));

    const makeNode = (ix) => {
        const nd = gl.nodes[ix];
        const prims = nd.mesh != null ? meshes[nd.mesh] : null;
        let o;
        if (prims && prims.length === 1 && !nd.children) {
            o = new T.Mesh(prims[0].g, prims[0].m);
        } else {
            o = new T.Group();
            if (prims) prims.forEach((pp) => o.add(new T.Mesh(pp.g, pp.m)));
        }
        o.name = nd.name || '';
        if (nd.translation) o.position.fromArray(nd.translation);
        if (nd.rotation) o.quaternion.fromArray(nd.rotation);
        if (nd.scale) o.scale.fromArray(nd.scale);
        (nd.children || []).forEach((c) => o.add(makeNode(c)));
        return o;
    };

    const root = new T.Group();
    gl.scenes[gl.scene || 0].nodes.forEach((ix) => root.add(makeNode(ix)));
    return root;
}
