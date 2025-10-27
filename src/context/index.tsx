import { ReactNode, createContext, useState } from "react";

interface MyContextType {
  value: string;
  updateValue: (value: string) => void;
}

export const MyContext = createContext<MyContextType>({
  value: "珏珏子",
  updateValue: () => {},
});

const MyProvider = ({ children }: { children: ReactNode }) => {
  const [contextValue, setContextValue] = useState<string>("珏珏子");

  const contextData: MyContextType = {
    value: contextValue,
    updateValue: setContextValue,
  };

  return (
    <MyContext.Provider value={contextData}>{children}</MyContext.Provider>
  );
};
export default MyProvider;
