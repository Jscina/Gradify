import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import "./app.css";

function App() {
  const [response, setResponse] = useState<string | null>(null);
  return (
    <>
      <h1>Hello, World!</h1>
      <p className="test-red-500">This is a Tauri app.</p>
      <Button
        className="bg-blue-500 text-white"
        onClick={async () => {
          const name = await invoke<string>("greet", { name: "josh" });
          setResponse(name);
        }}
      >
        Click me
      </Button>
      <p>{response}</p>
    </>
  );
}

export default App;
