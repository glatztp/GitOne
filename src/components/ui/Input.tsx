import React from "react";

export default function Input(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={`border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-400 ${
        props.className ?? ""
      }`}
    />
  );
}
