import brandingData from './branding.json';

/**
 * 全系統品牌設定檔
 * 集中管理品牌名稱與顯示邏輯，目前由 JSON 驅動
 */
export const BRAND_NAME = brandingData.BRAND_NAME;
export const APP_NAME = brandingData.APP_NAME;
export const FULL_APP_NAME = `${BRAND_NAME} ${APP_NAME}`;

// 版權宣告文字
export const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.`;

// 其他品牌化關鍵字
export const BRANDING = {
  sidebarTitle: brandingData.SIDEBAR_TITLE,
  loginTitle: brandingData.LOGIN_TITLE,
  registerWelcome: brandingData.REGISTER_WELCOME,
};
