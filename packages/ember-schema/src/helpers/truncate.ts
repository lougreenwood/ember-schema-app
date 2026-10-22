import { helper } from '@ember/component/helper';

function truncateString(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export default helper(function truncate([value]: [string]): string {
  if (value === undefined || value === '') return '';
  return truncateString(String(value));
});
