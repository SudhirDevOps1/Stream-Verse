export interface MediaItem {
  id: string;
  title: string;
  description: string;
  link: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
  rating?: number;
  views?: number;
  plays?: number;
  publish_date?: string;
  author?: string;
  host?: string;
  tags?: string[];
  cover?: string;
}

export interface MediaData {
  videos: MediaItem[];
  music: MediaItem[];
  podcasts: MediaItem[];
}

export type SectionType = 'video' | 'music' | 'gallery' | 'podcast';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLOUD PROVIDER TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type CloudProvider =
  | 'youtube'
  | 'mega'
  | 'gdrive'
  | 'dropbox'
  | 'onedrive'
  | 'pcloud'
  | 'sync'
  | 'internxt'
  | 'direct';

export interface CloudInfo {
  provider: CloudProvider;
  label: string;
  color: string;       // tailwind bg color
  textColor: string;   // tailwind text color
  borderColor: string; // tailwind border color
  icon: string;        // emoji or short label
  embedUrl: string;    // converted URL for embedding/streaming
  directUrl: string | null; // direct streaming URL if available (for HTML5 player)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DETECTION FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function isYouTubeLink(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/i.test(url);
}

export function isMegaLink(url: string): boolean {
  return /mega\.nz/i.test(url);
}

export function isGDriveLink(url: string): boolean {
  return /drive\.google\.com/i.test(url);
}

export function isDropboxLink(url: string): boolean {
  return /dropbox\.com|dl\.dropboxusercontent\.com/i.test(url);
}

export function isOneDriveLink(url: string): boolean {
  return /onedrive\.live\.com|1drv\.ms|sharepoint\.com/i.test(url);
}

export function isPCloudLink(url: string): boolean {
  return /pcloud\.(com|link)|e\.pcloud\.link/i.test(url);
}

export function isSyncLink(url: string): boolean {
  return /sync\.com|ln\.sync\.com/i.test(url);
}

export function isInternxtLink(url: string): boolean {
  return /internxt\.com/i.test(url);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// URL CONVERSION FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// YouTube
export function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0&modestbranding=1` : url;
}

export function getYouTubeVideoId(url: string): string {
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

export function getYouTubeThumbnail(url: string): string | null {
  const id = getYouTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

// Mega.nz
export function getMegaEmbedUrl(url: string): string {
  if (url.includes('mega.nz/embed/')) return url;
  if (url.includes('mega.nz/file/')) {
    return url.replace('mega.nz/file/', 'mega.nz/embed/');
  }
  return url;
}

// Google Drive
// Share: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
// Embed (preview with player): https://drive.google.com/file/d/FILE_ID/preview
// Direct stream: https://drive.google.com/uc?export=download&id=FILE_ID
export function getGDriveFileId(url: string): string {
  const m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return m[1];
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (m2) return m2[1];
  const m3 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (m3) return m3[1];
  return '';
}

export function getGDriveEmbedUrl(url: string): string {
  const id = getGDriveFileId(url);
  if (id) return `https://drive.google.com/file/d/${id}/preview`;
  return url;
}

export function getGDriveDirectUrl(url: string): string | null {
  const id = getGDriveFileId(url);
  if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
  return null;
}

// Dropbox
// Share: https://www.dropbox.com/s/HASH/filename.ext?dl=0
// Raw (direct): https://www.dropbox.com/s/HASH/filename.ext?raw=1
// Or: https://dl.dropboxusercontent.com/s/HASH/filename.ext
export function getDropboxDirectUrl(url: string): string {
  // Already a direct download link
  if (url.includes('dl.dropboxusercontent.com')) return url;
  // Convert share link to raw
  let directUrl = url.replace(/[?&]dl=\d/, '');
  directUrl = directUrl.replace(/[?&]raw=\d/, '');
  // Add raw=1
  const sep = directUrl.includes('?') ? '&' : '?';
  return `${directUrl}${sep}raw=1`;
}

export function getDropboxEmbedUrl(url: string): string {
  return getDropboxDirectUrl(url);
}

// OneDrive
// Share: https://onedrive.live.com/?...&id=...
// Embed: https://onedrive.live.com/embed?...
// 1drv.ms short links → use iframe
export function getOneDriveEmbedUrl(url: string): string {
  // Already an embed link
  if (url.includes('/embed')) return url;
  // Convert 1drv.ms or regular links for iframe embed
  // OneDrive share links can be converted by replacing 'redir' with 'embed'
  if (url.includes('1drv.ms')) return url; // Short links work in iframe
  // Try converting standard share link to embed
  return url.replace('/redir?', '/embed?').replace('/view.aspx', '/embed');
}

// pCloud
// Share: https://e.pcloud.link/publink/show?code=CODE
// Direct download: https://e.pcloud.link/publink/show?code=CODE (same, plays in iframe)
export function getPCloudEmbedUrl(url: string): string {
  return url;
}

// Sync.com
export function getSyncEmbedUrl(url: string): string {
  return url;
}

// Internxt
export function getInternxtEmbedUrl(url: string): string {
  return url;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MASTER: Get cloud info for any URL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function getCloudInfo(url: string): CloudInfo {
  if (isYouTubeLink(url)) {
    return {
      provider: 'youtube',
      label: 'YouTube',
      color: 'bg-red-500/20',
      textColor: 'text-red-400',
      borderColor: 'border-red-500/30',
      icon: '▶',
      embedUrl: getYouTubeEmbedUrl(url),
      directUrl: null,
    };
  }

  if (isMegaLink(url)) {
    return {
      provider: 'mega',
      label: 'MEGA',
      color: 'bg-red-600/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-600/30',
      icon: '🔒',
      embedUrl: getMegaEmbedUrl(url),
      directUrl: null,
    };
  }

  if (isGDriveLink(url)) {
    return {
      provider: 'gdrive',
      label: 'Google Drive',
      color: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      icon: '📁',
      embedUrl: getGDriveEmbedUrl(url),
      directUrl: getGDriveDirectUrl(url),
    };
  }

  if (isDropboxLink(url)) {
    return {
      provider: 'dropbox',
      label: 'Dropbox',
      color: 'bg-blue-600/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-600/30',
      icon: '📦',
      embedUrl: getDropboxEmbedUrl(url),
      directUrl: getDropboxDirectUrl(url),
    };
  }

  if (isOneDriveLink(url)) {
    return {
      provider: 'onedrive',
      label: 'OneDrive',
      color: 'bg-sky-500/20',
      textColor: 'text-sky-400',
      borderColor: 'border-sky-500/30',
      icon: '☁️',
      embedUrl: getOneDriveEmbedUrl(url),
      directUrl: null,
    };
  }

  if (isPCloudLink(url)) {
    return {
      provider: 'pcloud',
      label: 'pCloud',
      color: 'bg-cyan-500/20',
      textColor: 'text-cyan-400',
      borderColor: 'border-cyan-500/30',
      icon: '🌩',
      embedUrl: getPCloudEmbedUrl(url),
      directUrl: null,
    };
  }

  if (isSyncLink(url)) {
    return {
      provider: 'sync',
      label: 'Sync.com',
      color: 'bg-indigo-500/20',
      textColor: 'text-indigo-400',
      borderColor: 'border-indigo-500/30',
      icon: '🔄',
      embedUrl: getSyncEmbedUrl(url),
      directUrl: null,
    };
  }

  if (isInternxtLink(url)) {
    return {
      provider: 'internxt',
      label: 'Internxt',
      color: 'bg-emerald-500/20',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      icon: '🛡',
      embedUrl: getInternxtEmbedUrl(url),
      directUrl: null,
    };
  }

  return {
    provider: 'direct',
    label: 'Direct',
    color: 'bg-violet-500/20',
    textColor: 'text-violet-400',
    borderColor: 'border-violet-500/30',
    icon: '🎬',
    embedUrl: url,
    directUrl: url,
  };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Check if provider uses iframe embed
// (no HTML5 player control possible)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function isEmbedProvider(provider: CloudProvider): boolean {
  return ['youtube', 'mega', 'gdrive', 'onedrive', 'pcloud', 'sync', 'internxt'].includes(provider);
}

// Check if provider can give us a direct streamable URL
// (HTML5 <video>/<audio> tag can use it)
export function canDirectStream(provider: CloudProvider): boolean {
  return ['direct', 'dropbox'].includes(provider);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// THUMBNAIL HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function getThumbnail(item: MediaItem): string | null {
  if (item.thumbnail) return item.thumbnail;
  if (isYouTubeLink(item.link)) return getYouTubeThumbnail(item.link);
  return null;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FORMAT HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Shorthand used by existing code
export function getLinkType(url: string): 'youtube' | 'mega' | 'direct' {
  if (isYouTubeLink(url)) return 'youtube';
  if (isMegaLink(url)) return 'mega';
  return 'direct';
}
