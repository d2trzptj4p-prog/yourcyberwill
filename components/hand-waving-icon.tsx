"use client";

import { HandWaving as HandWavingIcon } from "@phosphor-icons/react";
import type { ComponentProps } from "react";

export function HandWavingIconClient(
  props: ComponentProps<typeof HandWavingIcon>,
) {
  return <HandWavingIcon {...props} />;
}
