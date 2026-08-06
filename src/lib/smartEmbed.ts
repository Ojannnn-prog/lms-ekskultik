export type EmbedPlatform =
  | "GOOGLE_DRIVE_FILE"
  | "GOOGLE_DOCS"
  | "GOOGLE_SLIDES"
  | "GOOGLE_SHEETS"
  | "YOUTUBE"
  | "PDF_DIRECT"
  | "EXTERNAL_LINK";

export interface SmartEmbedInfo {
  platform: EmbedPlatform;
  embedUrl: string;
  viewUrl: string;
  downloadUrl?: string;
  label: string;
  iconName: "drive" | "docs" | "slides" | "sheets" | "youtube" | "pdf" | "link";
  isEmbeddable: boolean;
}

/**
 * Menganalisis URL dan mengubah tautan sharing Google Drive / YouTube / PDF
 * menjadi tautan Embed & Preview yang siap ditampilkan pada iFrame responsif.
 */
export function parseSmartEmbedUrl(rawUrl?: string | null): SmartEmbedInfo | null {
  if (!rawUrl || !rawUrl.trim()) return null;
  const url = rawUrl.trim();

  // 1. Google Drive File (PDF, Video, Gambar, Dokumen dalam Drive)
  // Contoh: https://drive.google.com/file/d/1a2B3cD4eE5fF6gG7hH8iI9jJ0kK1lL2m/view?usp=sharing
  // atau https://drive.google.com/open?id=1a2B3cD...
  const driveFileMatch =
    url.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/d\/([a-zA-Z0-9_-]+)/i) ||
    url.match(/drive\.google\.com\/.*[?&]id=([a-zA-Z0-9_-]+)/i);

  if (driveFileMatch && driveFileMatch[1]) {
    const fileId = driveFileMatch[1];
    return {
      platform: "GOOGLE_DRIVE_FILE",
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      label: "Google Drive File",
      iconName: "drive",
      isEmbeddable: true,
    };
  }

  // 2. Google Docs
  // Contoh: https://docs.google.com/document/d/1a2B3cD4eE5fF6gG7hH8iI9jJ0kK1lL2m/edit?usp=sharing
  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/i);
  if (docsMatch && docsMatch[1]) {
    const docId = docsMatch[1];
    return {
      platform: "GOOGLE_DOCS",
      embedUrl: `https://docs.google.com/document/d/${docId}/preview`,
      viewUrl: `https://docs.google.com/document/d/${docId}/edit?usp=sharing`,
      label: "Google Docs",
      iconName: "docs",
      isEmbeddable: true,
    };
  }

  // 3. Google Slides (Presentasi)
  // Contoh: https://docs.google.com/presentation/d/1a2B3cD4eE5fF6gG7hH8iI9jJ0kK1lL2m/edit
  const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/i);
  if (slidesMatch && slidesMatch[1]) {
    const slideId = slidesMatch[1];
    return {
      platform: "GOOGLE_SLIDES",
      embedUrl: `https://docs.google.com/presentation/d/${slideId}/embed?start=false&loop=false&delayms=3000`,
      viewUrl: `https://docs.google.com/presentation/d/${slideId}/edit?usp=sharing`,
      label: "Google Slides",
      iconName: "slides",
      isEmbeddable: true,
    };
  }

  // 4. Google Sheets
  const sheetsMatch = url.match(/docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/i);
  if (sheetsMatch && sheetsMatch[1]) {
    const sheetId = sheetsMatch[1];
    return {
      platform: "GOOGLE_SHEETS",
      embedUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/preview`,
      viewUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/edit?usp=sharing`,
      label: "Google Sheets",
      iconName: "sheets",
      isEmbeddable: true,
    };
  }

  // 5. YouTube Video
  // Contoh: https://www.youtube.com/watch?v=XXXXX atau https://youtu.be/XXXXX
  const youtubeMatch =
    url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (youtubeMatch && youtubeMatch[1]) {
    const videoId = youtubeMatch[1];
    return {
      platform: "YOUTUBE",
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
      viewUrl: `https://www.youtube.com/watch?v=${videoId}`,
      label: "YouTube Video",
      iconName: "youtube",
      isEmbeddable: true,
    };
  }

  // 6. PDF Eksternal Direct
  if (url.toLowerCase().endsWith(".pdf")) {
    return {
      platform: "PDF_DIRECT",
      embedUrl: url,
      viewUrl: url,
      label: "Dokumen PDF",
      iconName: "pdf",
      isEmbeddable: true,
    };
  }

  // 7. External Link Default
  return {
    platform: "EXTERNAL_LINK",
    embedUrl: url,
    viewUrl: url,
    label: "Tautan Eksternal",
    iconName: "link",
    isEmbeddable: false,
  };
}
