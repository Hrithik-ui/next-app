import { useState } from 'react'
import './App.css'
import NavBar from "./components/Navbar"
import Welcome from './components/Welcome'
import Services from "./components/Services"
import Transactions from "./components/Transactions"
import Footer from "./components/Footer"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen">
      <div className="gradient-bg-welcome">
        <NavBar/>
      <Welcome/>
      </div>
      <Services/>
      <Transactions/>
      {/*<Footer/>*/}
    </div>
  )
}

export default App
