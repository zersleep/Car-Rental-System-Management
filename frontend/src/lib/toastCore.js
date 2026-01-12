import { createContext, useContext } from "react";

export const ToastContext = createContext({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);
