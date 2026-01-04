import type { SetStateAction } from "react";

export type DialogControl = {open: boolean; setOpen: React.Dispatch<SetStateAction<boolean>>};