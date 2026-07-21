export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const user = localStorage.getItem('devtrack_current_user');
    const token = localStorage.getItem('devtrack_github_token');
    return !!(user || token);
  } catch (e) {
    return false;
  }
}

export async function exportCardToPNG(cardElement: HTMLElement, username: string): Promise<void> {
  if (!cardElement) {
    throw new Error('Card element not found for export.');
  }

  // Dynamic client-side import of html-to-image
  const { toPng } = await import('html-to-image');

  // High resolution export (pixelRatio 3x)
  const dataUrl = await toPng(cardElement, {
    quality: 0.98,
    pixelRatio: 3,
    cacheBust: true,
    filter: (node) => {
      if (node instanceof HTMLElement && node.dataset?.exportExclude === 'true') {
        return false;
      }
      return true;
    },
  });

  // Create temporary link and download
  const link = document.createElement('a');
  link.download = `devtrack_card_${username.toLowerCase()}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportCardToPDF(cardElement: HTMLElement, username: string): Promise<void> {
  if (!cardElement) {
    throw new Error('Card element not found for export.');
  }

  // Dynamic client-side imports
  const { toPng } = await import('html-to-image');
  const { default: jsPDF } = await import('jspdf');

  // Generate PNG data URL first
  const dataUrl = await toPng(cardElement, {
    quality: 0.98,
    pixelRatio: 3,
    cacheBust: true,
    filter: (node) => {
      if (node instanceof HTMLElement && node.dataset?.exportExclude === 'true') {
        return false;
      }
      return true;
    },
  });

  // Initialize jsPDF document (A4 portrait)
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

  // Dark background for PDF document
  pdf.setFillColor(13, 17, 23); // #0D1117
  pdf.rect(0, 0, pageWidth, pageHeight, 'F');

  // Title header in PDF
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('DevTrack Verified Developer Identity', pageWidth / 2, 22, { align: 'center' });

  pdf.setTextColor(129, 140, 248); // Indigo 400
  pdf.setFontSize(10);
  pdf.text(`Official Developer Card for @${username}`, pageWidth / 2, 29, { align: 'center' });

  // Calculate card dimensions inside A4 page
  const cardWidth = 140; // 140mm width centered
  const imgProps = pdf.getImageProperties(dataUrl);
  const cardHeight = (imgProps.height * cardWidth) / imgProps.width;

  const xPos = (pageWidth - cardWidth) / 2;
  const yPos = 38;

  // Render high-res PNG image into PDF
  pdf.addImage(dataUrl, 'PNG', xPos, yPos, cardWidth, cardHeight);

  // Footer caption
  pdf.setTextColor(148, 163, 184); // Slate 400
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(
    'Verified via Live GitHub Telemetry • DevTrack Developer Platform',
    pageWidth / 2,
    yPos + cardHeight + 15,
    { align: 'center' }
  );

  pdf.save(`devtrack_card_${username.toLowerCase()}.pdf`);
}
