/* Crop-box maths. Rects are { x, y, w, h } in the photo's own pixels;
   size is { W, H }, the photo's full size. */

/** "5 / 2" → 2.5 */
export function parseAspect(aspect) {
  const [a, b = 1] = String(aspect).split('/').map(Number);
  return a / b;
}

/** Largest centred box with the given ratio. */
export function fitRect(W, H, ratio) {
  const w = Math.min(W, H * ratio);
  const h = w / ratio;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

/** Move the box by (dx, dy), keeping it on the photo. */
export function moveRect(r, dx, dy, { W, H }) {
  return {
    ...r,
    x: Math.min(W - r.w, Math.max(0, r.x + dx)),
    y: Math.min(H - r.h, Math.max(0, r.y + dy)),
  };
}

/**
 * Resize from a handle while keeping the ratio. The opposite corner/edge stays
 * put; edge handles grow around the box's centre line.
 * handle: { sx, sy } — which side is dragged (-1, 0 or 1 on each axis)
 */
export function resizeRect(r, { sx, sy }, dx, dy, ratio, { W, H }, minW) {
  // Fixed anchor point
  const ax = sx > 0 ? r.x : sx < 0 ? r.x + r.w : r.x + r.w / 2;
  const ay = sy > 0 ? r.y : sy < 0 ? r.y + r.h : r.y + r.h / 2;

  // Width the pointer asks for (corners follow whichever axis moved further)
  const wantX = sx ? r.w + dx * sx : 0;
  const wantY = sy ? (r.h + dy * sy) * ratio : 0;
  let w = sx && sy ? Math.max(wantX, wantY) : sx ? wantX : wantY;

  // Room available from the anchor to the photo edges
  const roomX = sx > 0 ? W - ax : sx < 0 ? ax : 2 * Math.min(ax, W - ax);
  const roomY = sy > 0 ? H - ay : sy < 0 ? ay : 2 * Math.min(ay, H - ay);
  const maxW = Math.min(roomX, roomY * ratio);
  w = Math.min(maxW, Math.max(Math.min(minW, maxW), w));
  const h = w / ratio;

  return {
    x: sx > 0 ? ax : sx < 0 ? ax - w : ax - w / 2,
    y: sy > 0 ? ay : sy < 0 ? ay - h : ay - h / 2,
    w,
    h,
  };
}

/**
 * Renders the crop box to a JPEG data URL.
 * @param img      the loaded <img> element
 * @param rect     crop box in the image's natural pixels
 * @param outWidth output width in px (height keeps the box's ratio)
 */
export function exportCrop(img, rect, outWidth) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(outWidth);
  canvas.height = Math.round((outWidth * rect.h) / rect.w);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h, 0, 0, canvas.width, canvas.height);
  // JPEG at 0.82 keeps photos small enough for localStorage
  return canvas.toDataURL('image/jpeg', 0.82);
}

/**
 * Shrinks an image file (longest side ≤ maxSide) to a JPEG data URL, no cropping.
 * Used for gallery photos, which are shown whole.
 */
export async function shrinkPhoto(file, maxSide = 1200) {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * k);
    canvas.height = Math.round(img.naturalHeight * k);
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}
