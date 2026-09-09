/* Is this WebGL context rasterised in software (SwiftShader, llvmpipe, a driverless
   VM)? PageSpeed Insights and Lighthouse run on such machines, and there every frame
   of a real scene blocks the main thread for most of a second: the Disney+ page
   scored 41 with 34 seconds of blocking time for a castle that shimmers. A scene
   that asks draws one still and stops; a real GPU never enters that branch. */
export function isSoftwareGL(gl) {
  try {
    const x = gl.getExtension('WEBGL_debug_renderer_info');
    const r = String((x && gl.getParameter(x.UNMASKED_RENDERER_WEBGL)) || gl.getParameter(gl.RENDERER) || '');
    return /swiftshader|llvmpipe|softpipe|software|mesa offscreen|basic render/i.test(r);
  } catch (e) { return false; }
}
