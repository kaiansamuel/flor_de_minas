import { useEffect, useRef } from 'react';
import markup from '../legacy/page.html?raw';
import story from '../legacy/story.js?raw';
import effects from '../legacy/effects.js?raw';
import '../styles/original.css';
import '../styles/global.css';

function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.dataset.florMinasVendor = '';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

function runLegacyScripts() {
  const records = [];
  const trackedFrames = new Set();
  const targetAdd = EventTarget.prototype.addEventListener;
  const nativeFrame = window.requestAnimationFrame.bind(window);
  const nativeCancel = window.cancelAnimationFrame.bind(window);
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    records.push([this, type, listener, options]);
    return targetAdd.call(this, type, listener, options);
  };
  window.requestAnimationFrame = (callback) => {
    let id;
    id = nativeFrame((time) => {
      trackedFrames.delete(id);
      callback(time);
    });
    trackedFrames.add(id);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    trackedFrames.delete(id);
    nativeCancel(id);
  };

  [story, effects].forEach((source) => {
    const script = document.createElement('script');
    script.textContent = source;
    document.body.appendChild(script);
    script.remove();
  });
  EventTarget.prototype.addEventListener = targetAdd;

  return () => {
    records.forEach(([target, type, listener, options]) => target.removeEventListener(type, listener, options));
    trackedFrames.forEach(nativeCancel);
    window.requestAnimationFrame = nativeFrame;
    window.cancelAnimationFrame = nativeCancel;
    document.querySelectorAll('#order-dialog, #visit-button, #order-dialog .close').forEach((element) => { element.onclick = null; });
    window.__florMinasScenes?.forEach((scene) => scene.traverse((object) => {
      object.geometry?.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.filter(Boolean).forEach((material) => {
        Object.values(material).forEach((value) => { if (value?.isTexture) value.dispose(); });
        material.dispose();
      });
    }));
    window.__florMinasTargets?.forEach((target) => target.dispose());
    window.__florMinasTextures?.forEach((texture) => texture.dispose());
    if (window.THREE?.TextureLoader && window.__florMinasTextureLoaderLoad) window.THREE.TextureLoader.prototype.load = window.__florMinasTextureLoaderLoad;
    window.__florMinasRenderer?.dispose();
    window.__florMinasRenderer?.forceContextLoss();
    delete window.__florMinasScenes;
    delete window.__florMinasTargets;
    delete window.__florMinasTextures;
    delete window.__florMinasTextureLoaderLoad;
    delete window.__florMinasRenderer;
    document.querySelectorAll('script[data-flor-minas-vendor]').forEach((script) => script.remove());
  };
}

function showStaticHero() {
  document.querySelector('#stage')?.classList.add('webgl-fallback');
  document.querySelector('#loading')?.classList.add('done');
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('visible'));
  const error = document.querySelector('#error');
  if (error) error.style.display = 'none';
}

export default function OriginalExperience() {
  const mountRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let cleanupLegacy = () => {};
    Promise.all([
      loadScript('/assets/cdn.tailwindcss.com/3.4.17.js'),
      loadScript('/assets/cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js'),
    ]).then(([tailwindLoaded, threeLoaded]) => {
      if (cancelled) {
        document.querySelectorAll('script[data-flor-minas-vendor]').forEach((script) => script.remove());
        return;
      }
      if (tailwindLoaded && threeLoaded && mountRef.current) cleanupLegacy = runLegacyScripts();
      else showStaticHero();
    });
    return () => {
      cancelled = true;
      cleanupLegacy();
      document.querySelectorAll('script[data-flor-minas-vendor]').forEach((script) => script.remove());
    };
  }, []);

  return <div ref={mountRef} dangerouslySetInnerHTML={{ __html: markup }} />;
}
