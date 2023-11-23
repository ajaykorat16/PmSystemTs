import React, { createContext, useContext, ReactNode } from "react";
import moment from "moment";

interface HelperContextType {
  formatDate: (date: Date | null, format?: string | undefined) => string;
  onShow: () => void;
}

const HelperContext = createContext<HelperContextType | undefined>(undefined);

interface HelperProviderProps {
  children: ReactNode;
}

const HelperProvider: React.FC<HelperProviderProps> = ({ children }) => {
  const formatDate = (date: Date | null, format = 'YYYY-MM-DD') => {
    if (date !== null) {
      const inputTime = moment(date);
      return inputTime.format(format);
    } else {
      return "";
    }
  };

  const onShow = () => {
    let selectAllCheckbox = document.querySelector(
      ".p-multiselect-header > .p-checkbox"
    );
    if (selectAllCheckbox) {
      selectAllCheckbox.after(" Select All");
    }
  };

  return (
    <HelperContext.Provider value={{ formatDate, onShow }}>
      {children}
    </HelperContext.Provider>
  );
};

const useHelper = (): HelperContextType => {
  const context = useContext(HelperContext);
  if (!context) {
    throw new Error("useHelper must be used within a HelperProvider");
  }
  return context;
};

export { useHelper, HelperProvider };
