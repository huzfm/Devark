declare module "react-textfit" {
  import * as React from "react";
  export interface TextfitProps {
    mode?: "single" | "multi";
    min?: number;
    max?: number;
    throttle?: number;
    forceSingleModeWidth?: boolean;
    onReady?: (fontSize: number) => void;
    style?: React.CSSProperties;
    className?: string;
    children?: React.ReactNode;
  }
  export const Textfit: React.FC<TextfitProps>;
  export default Textfit;
}
