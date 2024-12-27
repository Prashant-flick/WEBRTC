import { Route, BrowserRouter, Routes } from "react-router-dom"
import Sender from './Components/Sender'
import Receiver from './Components/Receiver'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/sender" element={<Sender />} />
        <Route path="/receiver" element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
