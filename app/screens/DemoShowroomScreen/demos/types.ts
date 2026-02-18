import type { ReactElement } from "react";

import type { TxKeyPath } from "@/i18n";
import type { Theme } from "@/theme/types";

export interface Demo {
  data: (params: {
    themed: <T>(style: T) => T;
    theme: Theme;
  }) => ReactElement[];
  description: TxKeyPath;
  name: string;
}
