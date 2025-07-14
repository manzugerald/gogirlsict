import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ColumnOption } from './downloadColumnsModal';

// Update with your correct logo path
const LOGO_URL = '/assets/images/system/goGirlsLogoV2.png';
const HEADER_BG_COLOR = '#9f004d';
const FOOTER_BG_COLOR = '#9f004d';
const HEADER_HEIGHT = 28; // in jsPDF units (about 7mm)
const FOOTER_HEIGHT = 20;

const dateFields = ['createdAt', 'updatedAt', 'date', 'dateOfBirth'];

// Helper for Day.Month.Year format (e.g. 12.07.2025)
function getCurrentDayMonthYear() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  return `${day}.${month}.${year}`;
}

export async function handleDownloadPDF(data: any[], columns: ColumnOption[], cardName: string) {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load logo as base64
  const logoImg = await fetch(LOGO_URL)
    .then((r) => r.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        })
    );

  // ----- HEADER -----
  // Draw header background
  doc.setFillColor(HEADER_BG_COLOR);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, 'F');

  // Vertically center everything in the header
  const centerY = HEADER_HEIGHT / 2 + 1; // small correction for optical centering

  // Logo (vertically centered)
  const logoHeight = 18;
  const logoWidth = 18;
  const logoY = centerY - logoHeight / 2;
  doc.addImage(logoImg, 'PNG', 10, logoY, logoWidth, logoHeight);

  // "GoGirls ICT Initiative" (white, bold, large)
  doc.setFontSize(22);
  doc.setTextColor('#FFFFFF');
  doc.setFont('helvetica', 'bold');
  const orgName = 'GoGirls ICT Initiative';
  const orgNameX = 10 + logoWidth + 10; // logo + spacing
  doc.text(orgName, orgNameX, centerY, { baseline: 'middle' });

  // Card Name (black, bold, large, right-aligned, same line)
  doc.setFontSize(22);
  doc.setTextColor('#000000');
  doc.setFont('helvetica', 'bold');
  const cardTextWidth = doc.getTextWidth(cardName);
  doc.text(cardName, pageWidth - 10 - cardTextWidth, centerY, { baseline: 'middle' });

  // ----- TABLE -----
  const headers = columns.map((col) => col.label);
  const rows = data.map((row, idx) =>
    columns.map((col) => {
      if (col.id === 'number') return idx + 1;
      if (dateFields.includes(col.id) && row[col.id]) {
        // Format all dates as Day.Month.Year
        const d = new Date(row[col.id]);
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(
          2,
          '0'
        )}.${d.getFullYear()}`;
      }
      return row[col.id] ?? '';
    })
  );

  autoTable(doc, {
    head: [headers],
    body: rows,
    startY: HEADER_HEIGHT + 6,
    margin: { left: 10, right: 10 },
    didDrawPage: function (data) {
      // ----- FOOTER -----
      // Draw footer background
      doc.setFillColor(FOOTER_BG_COLOR);
      doc.rect(0, pageHeight - FOOTER_HEIGHT, pageWidth, FOOTER_HEIGHT, 'F');

      // Footer content: copyright, day.month.year, org name, centered
      doc.setFontSize(13);
      doc.setTextColor('#FFFFFF');
      doc.setFont('helvetica', 'bold');
      const dayMonthYear = getCurrentDayMonthYear();
      const footerText = `System-Generated on ${dayMonthYear} ©GoGirls ICT Initiative`;
      const textWidth = doc.getTextWidth(footerText);
      const centerX = pageWidth / 2;
      const footerY = pageHeight - FOOTER_HEIGHT / 2 + 1; // optical center
      doc.text(footerText, centerX - textWidth / 2, footerY, { baseline: 'middle' });
    },
  });

  doc.save('table.pdf');
}
