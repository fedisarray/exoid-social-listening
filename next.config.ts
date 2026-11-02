import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");
const config: NextConfig = {
  poweredByHeader: false,
  logging: { serverFunctions: false },
};
export default withNextIntl(config);
