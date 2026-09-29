export const setFaviconBadge = (count: number) => {
  const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!favicon || count === 0) return;

  const originalHref = favicon.href;
  const originalType = favicon.type;
  const image = new Image();

  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 64;
    const context = canvas.getContext('2d');
    if (!context) return;

    context.drawImage(image, 0, 0, 64, 64);
    context.beginPath();
    context.arc(46, 46, 17, 0, Math.PI * 2);
    context.fillStyle = '#dc2626';
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = '#fff';
    context.stroke();

    const label = count > 9 ? '9+' : String(count);
    context.fillStyle = '#fff';
    context.font = `bold ${label.length > 1 ? 18 : 22}px sans-serif`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(label, 46, 47);

    favicon.type = 'image/png';
    favicon.href = canvas.toDataURL('image/png');
  };

  image.src = originalHref;

  return () => {
    image.onload = null;
    favicon.type = originalType;
    favicon.href = originalHref;
  };
};
