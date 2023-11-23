import moment from "moment";
import { useContext, createContext, ReactNode } from "react";

interface HelperContextProps {
  formatDate: (date: Date | null, format?: string) => string;
  onShow: () => void;
}

const HelperContext = createContext<HelperContextProps | undefined>(undefined);

interface HelperProviderProps {
  children: ReactNode;
}

const HelperProvider: React.FC<HelperProviderProps> = ({ children }) => {
  const formatDate = (date: Date | null, format = 'YYYY-MM-DD'): string => {
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

const useHelper = (): HelperContextProps => {
  const context = useContext(HelperContext);
  if (!context) {
    throw new Error("useHelper must be used within a HelperProvider");
  }
  return context;
};

export { useHelper, HelperProvider };
