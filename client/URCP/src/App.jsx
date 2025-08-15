import { Button } from "@/components/ui/button"
import Navigationbar from "./components/shared/Navigationbar"
import { useState, useEffect } from 'react';

function App() {
  return (
    <div className={`min-h-screen dark bg-black`}>
      <Navigationbar />
    </div>
  )
}

export default App