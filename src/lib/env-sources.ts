import type { SourceConfig } from './types';

export const BUILTIN_DEFAULT_SOURCES: Omit<SourceConfig, 'key'>[] = [
  { name: '猫眼资源 (4K超清)', url: 'https://api.maoyanapi.top/api.php/provide/vod' },
  { name: '爱坤资源 (1080P)', url: 'https://ikunzyapi.com/api.php/provide/vod/at/json' },
  { name: '最大资源 (1080P)', url: 'http://zuidazy.me/api.php/provide/vod/at/json' },
  { name: '魔都资源 (1080P)', url: 'https://www.mdzyapi.com/api.php/provide/vod/at/json' },
  { name: '优质资源 (1080P库)', url: 'https://api.1080zyku.com/inc/apijson.php' },
  { name: '电影天堂 (高清大片)', url: 'http://caiji.dyttzyapi.com/api.php/provide/vod/at/json' },
  { name: '豪华资源 (超清秒播)', url: 'https://haohuazy.com/api.php/provide/vod/at/json' },
  { name: '速播资源 (超清切片)', url: 'https://subocj.com/api.php/provide/vod/at/json' },
  { name: '360资源 (全量高清)', url: 'https://360zy.com/api.php/provide/vod/at/json' },
  { name: '非凡资源 (蓝光FHD)', url: 'https://cj.ffzyapi.com/api.php/provide/vod/at/json' },
  { name: '光速资源 (超清专线)', url: 'https://api.guangsuapi.com/api.php/provide/vod/at/json' },
  { name: '极速资源 (极速缓冲)', url: 'https://jszyapi.com/api.php/provide/vod/at/json' },
  { name: '量子资源 (全量快更)', url: 'https://cj.lziapi.com/api.php/provide/vod/at/json' },
  { name: '红牛资源 (秒开专线)', url: 'https://www.hongniuzy2.com/api.php/provide/vod/at/json' },
  { name: '暴风资源 (经典片库)', url: 'https://bfzyapi.com/api.php/provide/vod/at/json' },
  { name: '无尽资源 (全网聚合)', url: 'https://api.wujinapi.me/api.php/provide/vod/at/json' },
  { name: 'U酷资源 (优酷热播)', url: 'https://api.ukuapi.com/api.php/provide/vod/at/json' },
  { name: '樱花动漫 (新番专线)', url: 'https://m3u8.apiyhzy.com/api.php/provide/vod/at/json' },
];

/**
 * 部署者通过 DEFAULT_SOURCES 环境变量预置的采集站。
 * 格式为 JSON 数组：[{"name":"源名","url":"https://.../api.php/provide/vod","detail":"https://...","isAdult":false}]
 * 未设置时默认回退到精选内置高可用 18 个 4K/1080P 超清采集站。
 */
export function getEnvSources(): SourceConfig[] {
  const raw = process.env.DEFAULT_SOURCES;
  if (!raw || !raw.trim()) {
    return BUILTIN_DEFAULT_SOURCES.map((s, i) => ({
      key: `env_${i}`,
      name: s.name,
      url: s.url,
      isAdult: false,
    }));
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error('必须是 JSON 数组');
    const list: SourceConfig[] = parsed.map((item, i) => {
      if (typeof item !== 'object' || item === null) {
        throw new Error(`第 ${i + 1} 项不是对象`);
      }
      const { name, url, detail, isAdult } = item as Record<string, unknown>;
      if (typeof name !== 'string' || !name.trim()) {
        throw new Error(`第 ${i + 1} 项缺少 name`);
      }
      if (typeof url !== 'string' || !/^https?:\/\//.test(url.trim())) {
        throw new Error(`第 ${i + 1} 项的 url 必须以 http:// 或 https:// 开头`);
      }
      return {
        key: `env_${i}`,
        name: name.trim(),
        url: url.trim().replace(/\/+$/, ''),
        detail: typeof detail === 'string' && detail.trim() ? detail.trim() : undefined,
        isAdult: isAdult === true,
      };
    });
    return list;
  } catch (err) {
    console.warn('[LibreTV] DEFAULT_SOURCES 解析失败，已忽略：', err instanceof Error ? err.message : err);
    return BUILTIN_DEFAULT_SOURCES.map((s, i) => ({
      key: `env_${i}`,
      name: s.name,
      url: s.url,
      isAdult: false,
    }));
  }
}
