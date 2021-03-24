import { Dict } from '../type';

const escapedVal = v => (typeof v === 'number' ? v : `"${v}"`);

const buildFilter = (
  key: string,
  val: number | string | (string | number)[]
): string => {
  if (Array.isArray(val)) {
    if (val.length) {
      return `(${val.map(v => `${key}: ${escapedVal(v)}`).join(' OR ')})`;
    }
    return '';
  }
  if (val != null) {
    return `${key}: ${escapedVal(val)}`;
  }
  return '';
};

export const buildBaseQl = (
  filters: Dict<string | number>,
  ql?: string,
  withPackMeta?: boolean
): string => {
  let query = Object.entries(filters)
    .map(([key, val]) => (val != null ? buildFilter(key, val) : false))
    .filter(item => !!item)
    .join(' AND ');

  if (ql != null) {
    const [searchQl, analyzeQl] = ql?.split('|') ?? [];

    if (searchQl != null && searchQl.trim()) {
      query = `${searchQl} AND ${query}`;
    }

    if (analyzeQl != null && analyzeQl.trim()) {
      query += ` | ${analyzeQl}`;
    }
  }

  if (withPackMeta) {
    query += ' | with_pack_meta';
  }

  if (query?.length) {
    return `* AND ${query}`;
  }

  return '*';
};
