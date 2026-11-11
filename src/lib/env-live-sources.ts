import type { LiveSourceConfig } from './types';

export const BUILTIN_DEFAULT_LIVE_SOURCES: Omit<LiveSourceConfig, 'key'>[] = [
  {
    name: '范明明精选央卫视 (超清IPV6/低延时)',
    url: 'https://live.fanmingming.com/tv/m3u/ipv6.m3u',
    epg: 'https://live.fanmingming.com/e.xml',
  },
  {
    name: 'Guovin 自动测速精选直播 (CDN加速)',
    url: 'https://fastly.jsdelivr.net/gh/Guovin/iptv-api@gd/output/result.m3u',
    epg: 'https://epg.112114.xyz/pp.xml',
  },
  {
    name: 'YueChan 央视卫视精选 (CDN加速)',
    url: 'https://fastly.jsdelivr.net/gh/YueChan/Live@main/IPTV.m3u',
    epg: 'https://epg.112114.xyz/pp.xml',
  },
  {
    name: 'YanG 综合电视频道 (CDN加速)',
    url: 'https://fastly.jsdelivr.net/gh/YanG-1989/m3u@main/Gather.m3u',
    epg: 'https://epg.112114.xyz/pp.xml',
  },
];

/**
 * 部署者通过 DEFAULT_LIVE_SOURCES 环境变量预置的直播源（M3U 订阅）。
 * 格式为 JSON 数组：[{"name":"源名","url":"https://.../list.m3u","epg":"https://.../epg.xml.gz"}]
 * 未设置时默认回退到精选内置 4 套 CDN 加速直播源。
 */
export function getEnvLiveSources(): LiveSourceConfig[] {
  const raw = process.env.DEFAULT_LIVE_SOURCES;
  if (!raw || !raw.trim()) {
    return BUILTIN_DEFAULT_LIVE_SOURCES.map((s, i) => ({
      key: `envlive_${i}`,
      name: s.name,
      url: s.url,
      epg: s.epg,
    }));
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('必须是 JSON 数组');
    const list: LiveSourceConfig[] = parsed.map((item, i) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`第 ${i + 1} 项不是对象`);
      }
      const { name, url, epg } = item as Record<string, unknown>;
      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(`第 ${i + 1} 项缺少 name`);
      }
      if (typeof url !== 'string' || !/^https?:\/\//.test(url.trim())) {
        throw new Error(`第 ${i + 1} 项的 url 必须以 http:// 或 https:// 开头`);
      }
      return {
        key: `envlive_${i}`,
        name: name.trim(),
        url: url.trim().replace(/\/+$/, ''),
        epg: typeof epg === 'string' && epg.trim() ? epg.trim() : undefined,
      };
    });
    return list;
  } catch (err) {
    console.warn('[LibreTV] DEFAULT_LIVE_SOURCES 解析失败，已忽略：', err instanceof Error ? err.message : err);
    return BUILTIN_DEFAULT_LIVE_SOURCES.map((s, i) => ({
      key: `envlive_${i}`,
      name: s.name,
      url: s.url,
      epg: s.epg,
    }));
  }
}
