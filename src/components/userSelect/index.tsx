import { Radio, RadioChangeEvent } from "antd";
import { useContext } from "react";
import { MyContext } from "../../context";
import { members } from "./constants";

export const UserSelect = () => {
  const { value, updateValue } = useContext(MyContext);

  const onChange = (e: RadioChangeEvent) => {
    updateValue(e.target.value);
  };

  return (
    <Radio.Group onChange={onChange} value={value}>
      {members.map((m) => (
        <Radio key={m} value={m}>
          {m}
        </Radio>
      ))}
    </Radio.Group>
  );
};
