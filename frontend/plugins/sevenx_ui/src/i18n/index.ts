import { getI18n } from 'react-i18next';
import { en } from './en';
import { mn } from './mn';

export const SEVENX_NAMESPACE = 'sevenx';

const dictionaries: Record<string, Record<string, string>> = { en, mn };

/**
 * Adds the plugin's own dictionaries to the host i18next instance. The host
 * also tries to load the `sevenx` namespace from the gateway; keys shipped
 * here are kept and gateway keys fill in anything missing.
 */
export const registerSevenxLocales = () => {
  const i18n = getI18n();

  if (!i18n) {
    return;
  }

  Object.entries(dictionaries).forEach(([lng, dict]) => {
    i18n.addResourceBundle(lng, SEVENX_NAMESPACE, dict, true, false);
  });
};
